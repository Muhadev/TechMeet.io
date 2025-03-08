# payments/api/serializers.py
from rest_framework import serializers
from payments.models import Payment
from tickets.models import Ticket
from tickets.api.serializers import TicketSerializer
import secrets
import string
from django.conf import settings
import requests
from django.db import transaction

class PaymentSerializer(serializers.ModelSerializer):
    ticket_details = TicketSerializer(source='ticket', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'ticket', 'ticket_details', 'amount', 'currency', 
            'payment_method', 'transaction_id', 'status', 'paystack_reference',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'transaction_id', 'status', 'paystack_reference', 'created_at', 'updated_at']
    
    def validate_ticket(self, ticket):
        # Check if the ticket exists and is in pending status
        if ticket.payment_status != 'PENDING':
            raise serializers.ValidationError("This ticket has already been paid for")
        return ticket
    
    def validate(self, data):
        # Make sure the user owns the ticket
        if self.context['request'].user != data['ticket'].user:
            raise serializers.ValidationError("You can only pay for your own tickets")
        return data

class PaymentInitiateSerializer(serializers.Serializer):
    ticket_id = serializers.UUIDField()
    
    def validate_ticket_id(self, ticket_id):
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            
            # Check if ticket belongs to current user
            if ticket.user != self.context['request'].user:
                raise serializers.ValidationError("You can only pay for your own tickets")
                
            # Check if ticket is already paid for
            if ticket.payment_status != 'PENDING':
                raise serializers.ValidationError("This ticket has already been paid for")
                
            return ticket_id
        except Ticket.DoesNotExist:
            raise serializers.ValidationError("Ticket not found")
    
    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        ticket = Ticket.objects.get(id=validated_data['ticket_id'])
        
        # Generate a unique reference
        random_string = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        reference = f"TM-{ticket.id.hex[:8]}-{random_string}"
        
        # Create the payment record
        payment = Payment(
            user=user,
            ticket=ticket,
            amount=ticket.price_paid,
            currency='NGN',  # Default currency
            paystack_reference=reference
        )
        payment.save()
        
        # Initiate payment with Paystack
        paystack_secret_key = settings.PAYSTACK_SECRET_KEY
        headers = {
            'Authorization': f'Bearer {paystack_secret_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'email': user.email,
            'amount': int(ticket.price_paid * 100),  # Amount in kobo (or cents)
            'reference': reference,
            'callback_url': settings.PAYSTACK_CALLBACK_URL,
            'metadata': {
                'ticket_id': str(ticket.id),
                'payment_id': str(payment.id),
                'event_id': str(ticket.event.id),
                'user_id': str(user.id)
            }
        }
        
        # Make the API request to Paystack
        try:
            response = requests.post(
                'https://api.paystack.co/transaction/initialize',
                json=payload,
                headers=headers
            )
            response_data = response.json()
            
            if response.status_code == 200 and response_data['status']:
                # Return the payment data along with Paystack's authorization URL
                return {
                    'payment': payment,
                    'authorization_url': response_data['data']['authorization_url'],
                    'reference': reference
                }
            else:
                # If the request to Paystack failed, raise an error
                raise serializers.ValidationError(f"Payment initialization failed: {response_data.get('message', 'Unknown error')}")
                
        except Exception as e:
            # Delete the payment record since initialization failed
            payment.delete()
            raise serializers.ValidationError(f"Payment initialization failed: {str(e)}")

class PaymentVerifySerializer(serializers.Serializer):
    reference = serializers.CharField()
    
    def validate_reference(self, reference):
        try:
            payment = Payment.objects.get(paystack_reference=reference)
            return reference
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment reference not found")