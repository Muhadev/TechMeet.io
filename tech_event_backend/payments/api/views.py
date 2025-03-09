# payments/api/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from django.db import transaction
import requests
from payments.models import Payment
from tickets.models import Ticket
from core.permissions import IsAdmin
from .serializers import PaymentSerializer, PaymentInitiateSerializer, PaymentVerifySerializer
from core.email import send_ticket_confirmation

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['paystack_reference', 'transaction_id', 'status']
    ordering_fields = ['created_at', 'amount']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'history']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        elif self.action in ['initiate', 'verify', 'webhook']:
            return [permissions.AllowAny()]  # Webhook needs public access, but we'll secure it differently
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def initiate(self, request):
        """Initiate a payment for a ticket"""
        serializer = PaymentInitiateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            result = serializer.save()
            
            return Response({
                'payment_id': result['payment'].id,
                'reference': result['reference'],
                'authorization_url': result['authorization_url']
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify a payment using the reference"""
        serializer = PaymentVerifySerializer(data=request.data)
        
        if serializer.is_valid():
            reference = serializer.validated_data['reference']
            
            try:
                payment = Payment.objects.get(paystack_reference=reference)
                
                # Call Paystack to verify the payment
                paystack_secret_key = settings.PAYSTACK_SECRET_KEY
                headers = {'Authorization': f'Bearer {paystack_secret_key}'}
                
                response = requests.get(
                    f'https://api.paystack.co/transaction/verify/{reference}',
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data['status'] and data['data']['status'] == 'success':
                        with transaction.atomic():
                            # Update payment status
                            payment.status = 'COMPLETED'
                            payment.transaction_id = data['data']['id']
                            payment.save()
                            
                            # Update ticket status
                            ticket = payment.ticket
                            ticket.payment_status = 'COMPLETED'
                            ticket.save()
                            
                            # Get the profile picture URL from the user
                            profile_pic_url = None
                            if hasattr(ticket.user, 'profile_picture') and ticket.user.profile_picture:
                                # Try different ways to get the URL
                                if hasattr(ticket.user.profile_picture, 'url'):
                                    profile_pic_url = request.build_absolute_uri(ticket.user.profile_picture.url)
                                elif isinstance(ticket.user.profile_picture, str):
                                    profile_pic_url = ticket.user.profile_picture
                            
                            # Attach the profile URL to the ticket as a temporary attribute
                            ticket.profile_pic_url = profile_pic_url
                            
                            # Send confirmation email with ticket
                            send_ticket_confirmation(ticket)
                            
                            return Response({
                                'status': 'success',
                                'message': 'Payment verified successfully',
                                'data': PaymentSerializer(payment, context={'request': request}).data
                            })
                    else:
                        return Response({
                            'status': 'failed',
                            'message': 'Payment verification failed'
                        }, status=status.HTTP_400_BAD_REQUEST)
                        
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Could not verify payment with Paystack'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
            except Payment.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'Payment reference not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def webhook(self, request):
        """Handle Paystack webhooks"""
        # Verify the webhook signature (recommended for production)
        # For simplicity, we're not implementing signature verification here
        
        payload = request.data
        
        if payload.get('event') == 'charge.success':
            reference = payload['data']['reference']
            
            try:
                with transaction.atomic():
                    payment = Payment.objects.get(paystack_reference=reference)
                    
                    # Update payment status
                    payment.status = 'COMPLETED'
                    payment.transaction_id = payload['data']['id']
                    payment.save()
                    
                    # Update ticket status
                    ticket = payment.ticket
                    ticket.payment_status = 'COMPLETED'
                    ticket.save()
                    
                    # Send confirmation email with ticket
                    send_ticket_confirmation(ticket)
                    
                    return Response({'status': 'success'})
                    
            except Payment.DoesNotExist:
                return Response({'status': 'error', 'message': 'Payment not found'}, 
                                status=status.HTTP_404_NOT_FOUND)
        
        return Response({'status': 'ignored'})
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def history(self, request):
        """Get payment history for the current user"""
        payments = Payment.objects.filter(user=request.user).order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True, context={'request': request})
        return Response(serializer.data)