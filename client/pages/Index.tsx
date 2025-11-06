import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import QuotationGenerator from "@/components/QuotationGenerator";
import FileUploadArea from "@/components/FileUploadArea";
import FileTable from "@/components/FileTable";
import ClientInfoForm from "@/components/ClientInfoForm";
import QuotationSummary from "@/components/QuotationSummary";
import { useFileUpload } from "@/hooks/useFileUpload";

interface UploadedFile {
  id: string;
  file: File;
  thumbnail: string;
  previewPath?: string;
  fileType?: "stl" | "gltf" | "unsupported";
  printType: string;
  material: string;
  finish: string;
  quantity: number;
  volume: number; // in cubic cm
  weight: number; // in grams
  volumeMethod: "calculated" | "estimated";
  estimatedCost: number;
  isCalculatingVolume?: boolean;
}

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
  cgst: number; // percentage
  sgst: number; // percentage
  igst: number; // percentage
  packagingCharges: number; // fixed amount
  courierCharges: number; // fixed amount
}

import { PRINT_TYPES, MATERIALS, FINISHES } from "@/lib/printing";

export default function Index() {
  const { user, isAuthenticated, signOut } = useAuth();
  const {
    uploadedFiles,
    handleFileUpload,
    removeFile,
    updateFileProperty,
    recalculateAllCosts,
  } = useFileUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
    billingAddress: "",
    shippingAddress: "",
    sameAsbilling: true,
  });

  const [quotationCharges, setQuotationCharges] = useState<QuotationCharges>({
    cgst: 9,
    sgst: 9,
    igst: 0,
    packagingCharges: 50,
    courierCharges: 100,
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const totalCost = useMemo(
    () => uploadedFiles.reduce((sum, file) => sum + file.estimatedCost, 0),
    [uploadedFiles],
  );

  const calculateTaxDetails = () => {
    const subtotal = totalCost;
    const discountSettings = JSON.parse(
      localStorage.getItem("discountSettings") ||
        '{"enabled": false, "percentage": 0}',
    );
    const volumeDiscountSlabs = JSON.parse(
      localStorage.getItem("volumeDiscountSlabs") || "[]",
    );
    const totalVolume = uploadedFiles.reduce(
      (sum, file) => sum + file.volume * file.quantity,
      0,
    );
    let volumeDiscount = 0;
    let appliedVolumeDiscount = "";
    for (const slab of volumeDiscountSlabs.sort(
      (a: any, b: any) => b.minVolume - a.minVolume,
    )) {
      if (totalVolume >= slab.minVolume) {
        volumeDiscount = slab.discount;
        appliedVolumeDiscount = `${slab.discount}% (${slab.label})`;
        break;
      }
    }
    let nearSlabMessage = "";
    const sortedSlabs = volumeDiscountSlabs.sort(
      (a: any, b: any) => a.minVolume - b.minVolume,
    );
    for (const slab of sortedSlabs) {
      if (totalVolume < slab.minVolume) {
        const threshold = slab.minVolume * 0.7;
        if (totalVolume >= threshold) {
          const remaining = slab.minVolume - totalVolume;
          nearSlabMessage = `To get ${slab.discount}% extra discount (${slab.label}), add ${remaining.toFixed(0)} cm³ more volume.`;
        }
        break;
      }
    }
    const regularDiscountAmount = discountSettings.enabled
      ? (subtotal * discountSettings.percentage) / 100
      : 0;
    const volumeDiscountAmount = (subtotal * volumeDiscount) / 100;
    const totalDiscountAmount = regularDiscountAmount + volumeDiscountAmount;
    const afterDiscount = subtotal - totalDiscountAmount;
    const cgstAmount =
      quotationCharges.igst > 0
        ? 0
        : (afterDiscount * quotationCharges.cgst) / 100;
    const sgstAmount =
      quotationCharges.igst > 0
        ? 0
        : (afterDiscount * quotationCharges.sgst) / 100;
    const igstAmount =
      quotationCharges.igst > 0
        ? (afterDiscount * quotationCharges.igst) / 100
        : 0;
    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const totalAfterTax = afterDiscount + totalTax;
    const additionalChargesEnabled = JSON.parse(
      localStorage.getItem("additionalChargesEnabled") || "true",
    );
    const packaging = additionalChargesEnabled
      ? quotationCharges.packagingCharges
      : 0;
    const courier = additionalChargesEnabled
      ? quotationCharges.courierCharges
      : 0;
    const grandTotal = totalAfterTax + packaging + courier;
    return {
      subtotal,
      regularDiscountAmount,
      volumeDiscountAmount,
      appliedVolumeDiscount,
      totalDiscountAmount,
      afterDiscount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTax,
      totalAfterTax,
      grandTotal,
      totalVolume,
      nearSlabMessage,
      discountSettings,
      volumeDiscount,
    };
  };
  const taxDetails = useMemo(
    () => calculateTaxDetails(),
    [totalCost, uploadedFiles, quotationCharges],
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "minimumPriceSettings") recalculateAllCosts();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [recalculateAllCosts]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, [signOut]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {(() => {
                const logo = localStorage.getItem("company.logo");
                return logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="object-contain"
                    style={{ maxWidth: 120, maxHeight: 32 }}
                  />
                ) : (
                  <div className="text-gray-400 font-semibold">
                    Company Logo
                  </div>
                );
              })()}
              <span className="text-xl font-bold text-gray-900">
                PrintQuote
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome,{" "}
                    <span className="font-medium">{user.fullName}</span>
                  </span>
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/signin">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      size="sm"
                      className="bg-[#2563eb] hover:bg-[#1d4ed8]"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Instant 3D Printing Quotation
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Upload your CAD files and get an instant price estimate for your
              3D printing project.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 text-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Files
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FileUploadArea
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".stl,.step,.stp,.iges,.igs,.sldprt,.obj,.3mf,.ply"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />

        {uploadedFiles.length > 0 && (
          <div className="mt-8 space-y-8">
            <FileTable
              uploadedFiles={uploadedFiles}
              materials={MATERIALS}
              printTypes={PRINT_TYPES as unknown as any[]}
              finishes={FINISHES as unknown as any[]}
              onUpdateFile={updateFileProperty as any}
              onRemoveFile={removeFile}
            />

            <div className="text-center">
              <Button
                size="lg"
                className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
                onClick={() => {
                  document
                    .getElementById("client-info")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Generate Quotation
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Complete client information below to generate your quotation
              </p>
            </div>

            <ClientInfoForm
              clientInfo={clientInfo}
              quotationCharges={quotationCharges}
              onClientInfoChange={(field, value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  [field]:
                    field === "sameAsbilling" && value
                      ? ((prev.sameAsbilling = value),
                        (prev.shippingAddress = prev.billingAddress),
                        value)
                      : value,
                }))
              }
              onChargesChange={(field, value) =>
                setQuotationCharges((prev) => ({ ...prev, [field]: value }))
              }
            />

            <QuotationSummary
              uploadedFiles={uploadedFiles}
              taxDetails={taxDetails as any}
              quotationCharges={quotationCharges}
            />

            <div className="flex justify-center">
              <QuotationGenerator
                quotationData={{
                  files: uploadedFiles,
                  clientInfo: {
                    name: clientInfo.name,
                    gstNumber: clientInfo.gstNumber,
                    billingAddress: clientInfo.billingAddress,
                    shippingAddress: clientInfo.sameAsbilling
                      ? clientInfo.billingAddress
                      : clientInfo.shippingAddress,
                  },
                  charges: quotationCharges,
                  totalCost,
                  taxDetails: {
                    subtotal: taxDetails.subtotal,
                    cgstAmount: taxDetails.cgstAmount,
                    sgstAmount: taxDetails.sgstAmount,
                    igstAmount: taxDetails.igstAmount,
                    totalTax: taxDetails.totalTax,
                    grandTotal: taxDetails.grandTotal,
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
