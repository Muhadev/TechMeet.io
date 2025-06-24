import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps } from "class-variance-authority";
declare const Label: React.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React.RefAttributes<HTMLSpanElement>, "ref"> & VariantProps<(props?: import("class-variance-authority/types").ClassProp | undefined) => string> & React.RefAttributes<HTMLSpanElement>>;
export { Label };
