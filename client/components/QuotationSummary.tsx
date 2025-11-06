import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UploadedFile {
  volume: number;
  quantity: number;
  weight: number;
}

interface TaxDetails {
  subtotal: number;
  regularDiscountAmount: number;
  volumeDiscountAmount: number;
  appliedVolumeDiscount: string;
  totalDiscountAmount: number;
  afterDiscount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAfterTax: number;
  grandTotal: number;
  totalVolume: number;
  nearSlabMessage: string;
  discountSettings: any;
  volumeDiscount: number;
}

interface QuotationCharges {
  cgst: number;
  sgst: number;
  igst: number;
  packagingCharges: number;
  courierCharges: number;
}

interface QuotationSummaryProps {
  uploadedFiles: UploadedFile[];
  taxDetails: TaxDetails;
  quotationCharges: QuotationCharges;
}

export default function QuotationSummary({
  uploadedFiles,
  taxDetails,
  quotationCharges,
}: QuotationSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotation Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* File Summary */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">File Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Number of files:</span>
                <span className="font-medium">{uploadedFiles.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total items:</span>
                <span className="font-medium">
                  {uploadedFiles.reduce((sum, file) => sum + file.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total volume:</span>
                <span className="font-medium">
                  {uploadedFiles
                    .reduce((sum, file) => sum + file.volume * file.quantity, 0)
                    .toFixed(2)}{" "}
                  cm³
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total weight:</span>
                <span className="font-medium">
                  {uploadedFiles
                    .reduce((sum, file) => sum + file.weight * file.quantity, 0)
                    .toFixed(2)}{" "}
                  g
                </span>
              </div>
            </div>

            {/* Near-slab Discount Notification */}
            {taxDetails.nearSlabMessage && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-orange-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-800">
                      Volume Discount Opportunity!
                    </h4>
                    <p className="text-sm text-orange-700">
                      {taxDetails.nearSlabMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Cost Breakdown</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  ₹{taxDetails.subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Discount Section */}
              {(taxDetails.regularDiscountAmount > 0 ||
                taxDetails.volumeDiscountAmount > 0) && (
                <>
                  {taxDetails.regularDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>
                        Discount ({taxDetails.discountSettings.percentage}%):
                      </span>
                      <span>
                        - ₹
                        {taxDetails.regularDiscountAmount.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  )}
                  {taxDetails.volumeDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>
                        Volume Discount {taxDetails.appliedVolumeDiscount}:
                      </span>
                      <span>
                        - ₹
                        {taxDetails.volumeDiscountAmount.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-medium border-b pb-2">
                    <span>After Discount:</span>
                    <span>
                      ₹{taxDetails.afterDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}

              {quotationCharges.igst > 0 ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    IGST ({quotationCharges.igst}%):
                  </span>
                  <span className="font-medium">
                    ₹{Math.round(taxDetails.igstAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      CGST ({quotationCharges.cgst}%):
                    </span>
                    <span className="font-medium">
                      ₹
                      {Math.round(taxDetails.cgstAmount).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      SGST ({quotationCharges.sgst}%):
                    </span>
                    <span className="font-medium">
                      ₹
                      {Math.round(taxDetails.sgstAmount).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Packaging charges:</span>
                <span className="font-medium">
                  ₹{quotationCharges.packagingCharges.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Courier charges:</span>
                <span className="font-medium">
                  ₹{quotationCharges.courierCharges.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Grand Total:</span>
                  <span className="text-[#2563eb]">
                    ₹{Math.round(taxDetails.grandTotal).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Tax Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Tax Settings</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CGST rate:</span>
                <span className="font-medium">{quotationCharges.cgst}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">SGST rate:</span>
                <span className="font-medium">{quotationCharges.sgst}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">IGST rate:</span>
                <span className="font-medium">{quotationCharges.igst}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
