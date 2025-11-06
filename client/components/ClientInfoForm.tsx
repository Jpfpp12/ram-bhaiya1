import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
  shippingAddress: string;
  sameAsbilling: boolean;
}

interface QuotationCharges {
  cgst: number;
  sgst: number;
  igst: number;
  packagingCharges: number;
  courierCharges: number;
}

interface ClientInfoFormProps {
  clientInfo: ClientInfo;
  quotationCharges: QuotationCharges;
  onClientInfoChange: (field: keyof ClientInfo, value: any) => void;
  onChargesChange: (field: keyof QuotationCharges, value: number) => void;
}

export default function ClientInfoForm({
  clientInfo,
  quotationCharges,
  onClientInfoChange,
  onChargesChange,
}: ClientInfoFormProps) {
  return (
    <Card id="client-info">
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
        <CardDescription>
          Enter client details for quotation generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={clientInfo.name}
                onChange={(e) => onClientInfoChange("name", e.target.value)}
                placeholder="Enter client name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => onClientInfoChange("email", e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone *</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => onClientInfoChange("phone", e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={clientInfo.gstNumber}
                onChange={(e) =>
                  onClientInfoChange("gstNumber", e.target.value)
                }
                placeholder="Enter GST number (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address *</Label>
              <Textarea
                id="billingAddress"
                value={clientInfo.billingAddress}
                onChange={(e) =>
                  onClientInfoChange("billingAddress", e.target.value)
                }
                placeholder="Enter complete billing address"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  checked={clientInfo.sameAsbilling}
                  onChange={(e) =>
                    onClientInfoChange("sameAsbilling", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="sameAsBilling">
                  Shipping address same as billing
                </Label>
              </div>
            </div>

            {!clientInfo.sameAsbilling && (
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address *</Label>
                <Textarea
                  id="shippingAddress"
                  value={clientInfo.shippingAddress}
                  onChange={(e) =>
                    onClientInfoChange("shippingAddress", e.target.value)
                  }
                  placeholder="Enter shipping address"
                  rows={3}
                />
              </div>
            )}

            {/* Editable Charges */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-gray-900">Additional Charges</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packagingCharges">
                    Packaging Charges (₹)
                  </Label>
                  <Input
                    id="packagingCharges"
                    type="number"
                    value={quotationCharges.packagingCharges}
                    onChange={(e) =>
                      onChargesChange(
                        "packagingCharges",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courierCharges">Courier Charges (₹)</Label>
                  <Input
                    id="courierCharges"
                    type="number"
                    value={quotationCharges.courierCharges}
                    onChange={(e) =>
                      onChargesChange(
                        "courierCharges",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
