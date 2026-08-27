"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { BusinessInformationTab } from "../tabs/BusinessInformationTab";
import { FounderInformationTab } from "../tabs/FounderInformationTab";
import { DetailsTab } from "../tabs/DetailsTab";
import { FinancialTab } from "../tabs/FinancialTab";
import { DocumentsTab } from "../tabs/DocumentsTab";
import { ReviewTab } from "../tabs/ReviewTab";
import { DetailedStepIndicator } from "./DetailedStepIndicator";
import { validateStep, type StepErrors } from "../schema";
import { mapDbToForm } from "../actions";
import type { ApplicationFileField } from "../file-fields";
import type { StoredFileMetadata } from "./StoredFilePreview";

type ApplicationFormProps = {
  initialData?: any;
  isEdit?: boolean;
};

const STEPS = [
  { id: "business", name: "Business Info" },
  { id: "founder", name: "Founders" },
  { id: "details", name: "Details" },
  { id: "financial", name: "Financials" },
  { id: "documents", name: "Documents" },
  { id: "review", name: "Review" },
];

export function ApplicationForm({ initialData, isEdit }: ApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<string>("business");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<StepErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isVerifyingTin, setIsVerifyingTin] = useState(false);
  const [tinVerificationError, setTinVerificationError] = useState<string | null>(null);

  const [storedFiles, setStoredFiles] = useState<Record<ApplicationFileField, StoredFileMetadata | null>>({
    businessLicenseFileId: null,
    articlesOfIncorpFileId: null,
    pitchDeckFileId: null,
    financialsFileId: null,
  });
  const [removingFileField, setRemovingFileField] = useState<ApplicationFileField | null>(null);

  const [formState, setFormState] = useState({
    startupName: "",
    businessRegNumber: "",
    tinNumber: "",
    numberOfEmployees: "",
    foundingDate: "",
    industry: "",
    stage: "",
    website: "",
    businessEmail: "",
    altEmail: "",
    phoneNumber: "",
    businessRegistrationFile: null as File | null,
    articlesOfIncorporationFile: null as File | null,
    capital: "",
    totalShares: "",
    sharePrice: "",
    founders: [
      {
        firstName: "",
        lastName: "",
        nationalIdNumber: "",
        numberOfShares: "",
        email: "",
        phone: "",
        role: "",
      },
    ],
    businessDescription: "",
    problemStatement: "",
    solution: "",
    innovationDescription: "",
    targetMarket: "",
    competitiveAdvantage: "",
    scalabilityPlan: "",
    traction: "",
    riskAssessment: "",
    revenue: "",
    funding: "",
    fundingSources: "",
    investmentNeeded: "",
    useOfFunds: "",
    businessRegistration: null as File | null,
    pitchDeck: null as File | null,
    financialStatements: null as File | null,
  });

  const [draftId, setDraftId] = useState<string | null>(initialData?.id || null);

  const [founderVerification, setFounderVerification] = useState<{
    [key: number]: { isVerifying: boolean; error: string | null; verified: boolean };
  }>({
    0: { isVerifying: false, error: null, verified: false },
  });

  const isReadOnly = initialData && initialData.status !== "DRAFT" && initialData.status !== "ROLLED_BACK";

  useEffect(() => {
    if (initialData) {
      const mapped = mapDbToForm(initialData);
      setFormState((prev) => ({
        ...prev,
        ...mapped,
        // Reset file inputs as they are managed separately
        businessRegistrationFile: null,
        articlesOfIncorporationFile: null,
        businessRegistration: null,
        pitchDeck: null,
        financialStatements: null,
      }));

      const mapFile = (dbFile: any): StoredFileMetadata | null => {
        if (!dbFile) return null;
        return {
          id: dbFile.id,
          name: dbFile.originalName || "Unknown File",
          size: dbFile.size || 0,
          mimeType: dbFile.mimeType || "application/octet-stream",
          url: `/api/files/${dbFile.id}/download`,
        };
      };

      setStoredFiles({
        businessLicenseFileId: mapFile(initialData.businessLicenseFile),
        articlesOfIncorpFileId: mapFile(initialData.articlesOfIncorpFile),
        pitchDeckFileId: mapFile(initialData.pitchDeckFile),
        financialsFileId: mapFile(initialData.financialsFile),
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (isReadOnly) return;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (isReadOnly) return;
    const file = e.target.files ? e.target.files[0] : null;
    setFormState((prev) => ({ ...prev, [fieldName]: file }));
  };

  const validateStepCompletion = (step: string): boolean => {
    const errors = validateStep(step, formState);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStepCompletion(currentStep)) {
      setSaveError("Please fill in all required fields before proceeding.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaveError(null);

    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      setSaveError(null);

      const formData = new FormData();
      const {
        businessRegistrationFile,
        articlesOfIncorporationFile,
        businessRegistration,
        pitchDeck,
        financialStatements,
        ...restData
      } = formState;

      formData.append("data", JSON.stringify({
        ...restData,
        status: "DRAFT",
        ...(draftId ? { id: draftId } : {}),
      }));

      if (businessRegistrationFile instanceof File) formData.append("businessRegistrationFile", businessRegistrationFile);
      if (articlesOfIncorporationFile instanceof File) formData.append("articlesOfIncorporationFile", articlesOfIncorporationFile);
      if (businessRegistration instanceof File) formData.append("businessRegistration", businessRegistration);
      if (pitchDeck instanceof File) formData.append("pitchDeck", pitchDeck);
      if (financialStatements instanceof File) formData.append("financialStatements", financialStatements);

      const response = await fetch("/api/applications", {
        method: draftId ? "PATCH" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error || "Failed to save draft");
      }

      const result = await response.json();
      if (result?.data?.id) setDraftId(result.data.id);

      router.push("/dashboard/application");
      router.refresh();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setSaveError(null);

      const formData = new FormData();
      const {
        businessRegistrationFile,
        articlesOfIncorporationFile,
        businessRegistration,
        pitchDeck,
        financialStatements,
        ...restData
      } = formState;

      formData.append("data", JSON.stringify({
        ...restData,
        status: "PENDING",
        ...(draftId ? { id: draftId } : {}),
      }));

      if (businessRegistrationFile instanceof File) formData.append("businessRegistrationFile", businessRegistrationFile);
      if (articlesOfIncorporationFile instanceof File) formData.append("articlesOfIncorporationFile", articlesOfIncorporationFile);
      if (businessRegistration instanceof File) formData.append("businessRegistration", businessRegistration);
      if (pitchDeck instanceof File) formData.append("pitchDeck", pitchDeck);
      if (financialStatements instanceof File) formData.append("financialStatements", financialStatements);

      const response = await fetch("/api/applications", {
        method: draftId ? "PATCH" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json();
        const details = body?.details ? Object.values(body.details).flat().join("; ") : "";
        throw new Error(`${body?.error || "Failed to submit application"}${details ? `: ${details}` : ""}`);
      }

      const result = await response.json();
      const appId = result?.data?.id || draftId;

      router.push(appId ? `/dashboard/application/${appId}` : "/dashboard/application");
      router.refresh();
    } catch (err: any) {
      setSaveError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleVerifyTin = async () => {
    if (!formState.tinNumber) return;
    try {
      setIsVerifyingTin(true);
      setTinVerificationError(null);
      const res = await fetch(`/api/verify-tin?tin=${formState.tinNumber}`);
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to verify TIN");

      setFormState(prev => ({
        ...prev,
        startupName: result.data.businessName || prev.startupName,
        businessRegNumber: result.data.registrationNumber || prev.businessRegNumber,
        industry: result.data.industry || prev.industry,
        phoneNumber: result.data.phoneNumber || prev.phoneNumber,
        capital: result.data.capital || prev.capital,
      }));
    } catch (err: any) {
      setTinVerificationError(err.message);
    } finally {
      setIsVerifyingTin(false);
    }
  };

  const handleVerifyNationalId = async (index: number) => {
    const fcn = formState.founders[index].nationalIdNumber;
    if (!fcn) return;
    try {
      setFounderVerification(prev => ({ ...prev, [index]: { ...prev[index], isVerifying: true, error: null } }));
      const res = await fetch(`/api/verify-national-id?fcn=${fcn}`);
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to verify ID");

      setFormState(prev => {
        const nextFounders = [...prev.founders];
        nextFounders[index] = {
          ...nextFounders[index],
          firstName: result.data.firstName || nextFounders[index].firstName,
          lastName: result.data.lastName || nextFounders[index].lastName,
          email: result.data.email || nextFounders[index].email,
          phone: result.data.phoneNumber || nextFounders[index].phone,
        };
        return { ...prev, founders: nextFounders };
      });
      setFounderVerification(prev => ({ ...prev, [index]: { isVerifying: false, error: null, verified: true } }));
    } catch (err: any) {
      setFounderVerification(prev => ({ ...prev, [index]: { isVerifying: false, error: err.message, verified: false } }));
    }
  };

  const handleAddFounder = () => {
    setFormState(prev => ({
      ...prev,
      founders: [...prev.founders, { firstName: "", lastName: "", nationalIdNumber: "", numberOfShares: "", email: "", phone: "", role: "" }]
    }));
    setFounderVerification(prev => ({ ...prev, [Object.keys(prev).length]: { isVerifying: false, error: null, verified: false } }));
  };

  const handleRemoveFounder = (index: number) => {
    if (formState.founders.length <= 1) return;
    setFormState(prev => ({ ...prev, founders: prev.founders.filter((_, i) => i !== index) }));
  };

  const handleFounderInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: string) => {
    const { value } = e.target;
    setFormState(prev => {
      const nextFounders = [...prev.founders];
      nextFounders[index] = { ...nextFounders[index], [field]: value };
      return { ...prev, founders: nextFounders };
    });
  };

  const onRemoveStoredFile = async (field: ApplicationFileField) => {
    const fileId = formState[field as keyof typeof formState] as string | null;
    if (!fileId) return;
    setRemovingFileField(field);
    try {
      await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      setFormState(prev => ({ ...prev, [field]: null }));
      setStoredFiles(prev => ({ ...prev, [field]: null }));
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingFileField(null);
    }
  };

  const isStepComplete = (step: string) => {
    const errors = validateStep(step, formState);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-40 w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                <ArrowLeft className="h-4 w-4 text-brand-deep-dark/60" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-brand-deep-dark leading-none">
                  {isEdit ? "Edit " : "New "}Application
                </h1>
                <p className="text-xs text-brand-deep-dark/60 font-bold mt-0.5">
                  Step {STEPS.findIndex(s => s.id === currentStep) + 1} of {STEPS.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="font-bold text-brand-deep-dark px-4 h-9 text-sm"
                >
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Save Draft
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <DetailedStepIndicator steps={STEPS} currentStep={currentStep} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-1 px-2 sm:px-3">
        {saveError && (
          <div className="mb-4 sm:mb-8 flex gap-3 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-5 text-xs sm:text-sm text-brand-deep-dark border-l-4">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-black uppercase text-[10px] text-red-600 mb-1">Attention Required</p>
              <p className="font-medium">{saveError}</p>
            </div>
          </div>
        )}

        <div className="min-h-[500px] sm:min-h-[600px] flex flex-col">
          <div className="bg-white rounded-xl p-2 sm:p-3 md:p-4 flex-1">
            <Tabs value={currentStep} className="mt-0">
              <TabsContent value="business" className="mt-0">
                <BusinessInformationTab
                  formState={formState}
                  formErrors={formErrors}
                  handleInputChange={handleInputChange}
                  handleSelectChange={handleSelectChange}
                  handleFileChange={handleFileChange}
                  handleVerifyTin={handleVerifyTin}
                  handleSaveDraft={handleSaveDraft}
                  handleNext={handleNext}
                  isStepComplete={isStepComplete}
                  isSubmitting={isSubmitting}
                  isVerifyingTin={isVerifyingTin}
                  tinVerificationError={tinVerificationError}
                  storedFiles={storedFiles}
                  onRemoveStoredFile={onRemoveStoredFile}
                  removingFileField={removingFileField}
                  isReadOnly={isReadOnly}
                />
              </TabsContent>

              <TabsContent value="founder" className="mt-0">
                <FounderInformationTab
                  formState={formState}
                  formErrors={formErrors}
                  handleFounderInputChange={handleFounderInputChange}
                  handleInputChange={handleInputChange}
                  handleAddFounder={handleAddFounder}
                  handleRemoveFounder={handleRemoveFounder}
                  handleVerifyNationalId={handleVerifyNationalId}
                  handleSaveDraft={handleSaveDraft}
                  handleNext={handleNext}
                  handleBack={handleBack}
                  isStepComplete={isStepComplete}
                  isSubmitting={isSubmitting}
                  founderVerification={founderVerification}
                  isReadOnly={isReadOnly}
                />
              </TabsContent>

              <TabsContent value="details" className="mt-0">
                <DetailsTab
                  formState={formState}
                  formErrors={formErrors}
                  handleInputChange={handleInputChange}
                  handleBack={handleBack}
                  handleSaveDraft={handleSaveDraft}
                  handleNext={handleNext}
                  isStepComplete={isStepComplete}
                  isSubmitting={isSubmitting}
                  isReadOnly={isReadOnly}
                />
              </TabsContent>

              <TabsContent value="financial" className="mt-0">
                <FinancialTab
                  formState={formState}
                  formErrors={formErrors}
                  handleInputChange={handleInputChange}
                  handleBack={handleBack}
                  handleSaveDraft={handleSaveDraft}
                  handleNext={handleNext}
                  isStepComplete={isStepComplete}
                  isSubmitting={isSubmitting}
                  isReadOnly={isReadOnly}
                />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <DocumentsTab
                  formState={formState}
                  formErrors={formErrors}
                  handleFileChange={handleFileChange}
                  handleBack={handleBack}
                  handleSaveDraft={handleSaveDraft}
                  handleNext={handleNext}
                  isStepComplete={isStepComplete}
                  isSubmitting={isSubmitting}
                  storedFiles={storedFiles}
                  onRemoveStoredFile={onRemoveStoredFile}
                  removingFileField={removingFileField}
                  isReadOnly={isReadOnly}
                />
              </TabsContent>

              <TabsContent value="review" className="mt-0">
                <ReviewTab
                  formState={formState}
                  handleBack={handleBack}
                  handleSaveDraft={handleSaveDraft}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  storedFiles={storedFiles}
                  isReadOnly={isReadOnly}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
