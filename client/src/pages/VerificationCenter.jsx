import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { verificationService } from '../services/api';
import DocumentUploadCard from '../components/common/DocumentUploadCard';
import { 
  ShieldCheck, ShieldAlert, Clock, Check, 
  User, CreditCard, Car, ArrowRight, ArrowLeft, 
  Phone, Mail, UserCheck, HeartHandshake, AlertCircle
} from 'lucide-react';

export default function VerificationCenter() {
  const { user, refreshUser, verifyPhone, verifyEmail } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1 State (Personal details verification simulation)
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  // Step 2 State (Government ID)
  const [docType, setDocType] = useState('Aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [docImage, setDocImage] = useState('');

  // Step 3 State (Driver Proofs)
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseImage, setLicenseImage] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [rcImage, setRcImage] = useState('');
  const [insuranceImage, setInsuranceImage] = useState('');
  const [pollutionImage, setPollutionImage] = useState('');
  
  // Vehicle details
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState(4);

  // Fetch status on load
  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await verificationService.getVerificationStatus();
      setStatusData(data);

      // Pre-fill fields if they exist
      if (data.documents && data.documents.length > 0) {
        // Find latest/active document
        const latestDoc = data.documents[data.documents.length - 1];
        setDocType(latestDoc.docType);
        setDocNumber(latestDoc.docNumber);
        setDocImage(latestDoc.docImage);
      }

      if (data.driverProof) {
        setLicenseNumber(data.driverProof.licenseNumber || '');
        setLicenseImage(data.driverProof.licenseImage || '');
        setRcNumber(data.driverProof.rcNumber || '');
        setRcImage(data.driverProof.rcImage || '');
        setInsuranceImage(data.driverProof.insuranceImage || '');
        setPollutionImage(data.driverProof.pollutionImage || '');
      }

      if (data.vehicle) {
        setVehicleType(data.vehicle.vehicleType || 'Sedan');
        setVehicleModel(data.vehicle.vehicleModel || '');
        setVehicleNumber(data.vehicle.vehicleNumber || '');
        setSeatsAvailable(data.vehicle.seatsAvailable || 4);
      }

    } catch (err) {
      console.error("Failed to fetch verification status:", err);
      setError('Could not load verification records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSimulatePhoneVerify = async () => {
    setPhoneVerifying(true);
    try {
      await verifyPhone();
      await fetchStatus();
      setSuccessMsg('Phone number verified successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Phone verification failed.');
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleSimulateEmailVerify = async () => {
    setEmailVerifying(true);
    try {
      await verifyEmail();
      await fetchStatus();
      setSuccessMsg('Email verified successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Email verification failed.');
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    if (!docNumber || !docImage) {
      setError('Please provide document number and upload a valid image.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await verificationService.uploadIdDocument({ docType, docNumber, docImage });
      await refreshUser();
      await fetchStatus();
      setSuccessMsg('Government ID proof submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setActiveStep(3); // Move to driver details step
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    if (!licenseNumber || !licenseImage || !rcNumber || !rcImage || !insuranceImage || !vehicleModel || !vehicleNumber) {
      setError('Please fill in all driving details, vehicle details, and upload the required proof documents.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await verificationService.uploadDriverProof({
        licenseNumber,
        licenseImage,
        rcNumber,
        rcImage,
        insuranceImage,
        pollutionImage,
        vehicleType,
        vehicleModel,
        vehicleNumber,
        seatsAvailable: Number(seatsAvailable)
      });
      await refreshUser();
      await fetchStatus();
      setSuccessMsg('Driver & Vehicle verification submitted! Under admin review.');
      setActiveStep(1); // Go back to start
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-500 animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm">Loading verification details...</p>
      </div>
    );
  }

  // Get status color utilities
  const getStatusColor = () => {
    if (statusData?.verificationStatus === 'verified') return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
    if (statusData?.verificationStatus === 'pending') return 'bg-amber-500/10 text-amber-700 border-amber-200';
    if (statusData?.verificationStatus === 'rejected') return 'bg-rose-500/10 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusLabel = () => {
    if (statusData?.verificationStatus === 'verified') return 'Fully Verified Publisher';
    if (statusData?.verificationStatus === 'pending') return 'Pending Verification';
    if (statusData?.verificationStatus === 'rejected') return 'Verification Rejected';
    return 'Unverified User';
  };

  const activeDoc = statusData?.documents?.[statusData.documents.length - 1] || null;
  const activeDriver = statusData?.driverProof || null;
  const activeVehicle = statusData?.vehicle || null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl shrink-0 ${
              statusData?.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-500' :
              statusData?.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-500' :
              statusData?.verificationStatus === 'rejected' ? 'bg-rose-50 text-rose-500' :
              'bg-slate-50 text-slate-400'
            }`}>
              {statusData?.verificationStatus === 'verified' ? (
                <ShieldCheck className="h-10 w-10" />
              ) : statusData?.verificationStatus === 'pending' ? (
                <Clock className="h-10 w-10" />
              ) : (
                <ShieldAlert className="h-10 w-10" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Verification Center</h1>
              <p className="text-sm text-slate-500 mt-1">Verify your identity and vehicles to build trust and become a Ride Publisher.</p>
              
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
                  {getStatusLabel()}
                </span>
                {statusData?.isIdentityVerified && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Govt ID Active
                  </span>
                )}
                {statusData?.isDriverVerified && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                    <Car className="h-3 w-3" /> Driver Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Trust Score Widget */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-slate-200 fill-none" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" 
                  className={`fill-none stroke-linecap-round transition-all duration-1000 ${
                    statusData?.trustScore >= 80 ? 'stroke-emerald-500' :
                    statusData?.trustScore >= 55 ? 'stroke-indigo-500' :
                    'stroke-amber-500'
                  }`}
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - (statusData?.trustScore || 20) / 100)}
                />
              </svg>
              <span className="absolute font-bold text-slate-800 text-base">{statusData?.trustScore || 20}%</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Trust Score</span>
              <span className="text-sm font-semibold text-slate-700">
                {statusData?.trustScore >= 80 ? 'Excellent' :
                 statusData?.trustScore >= 50 ? 'Moderate' : 'Basic'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Warning / Info Alerts */}
        {statusData?.verificationStatus === 'pending' && (
          <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 text-sm">
            <Clock className="h-5 w-5 shrink-0 text-amber-500 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold">Documents Pending Admin Review:</span> Your uploaded documents are under review. Basic booking functions are fully active, but you must wait for approval before you can publish a ride. Reviews take 4-12 hours in India.
            </div>
          </div>
        )}

        {statusData?.verificationStatus === 'rejected' && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-800 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <span className="font-bold">Rejection Notice:</span> One or more of your verification documents were rejected by the moderator. Please examine the steps below, update details, and submit again for verification.
            </div>
          </div>
        )}
      </div>

      {/* Main Alert notifications */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2 text-sm">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEEPER COMPONENT */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative px-2">
          {/* Background Connector Bar */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 transition-all duration-300 z-0"
            style={{ width: `${((activeStep - 1) / 2) * 100}%` }}
          ></div>

          {/* Step 1 Node */}
          <button 
            onClick={() => setActiveStep(1)}
            className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              activeStep > 1 ? 'bg-brand-500 border-brand-500 text-white' :
              activeStep === 1 ? 'bg-white border-brand-500 text-brand-600 ring-4 ring-brand-500/10' :
              'bg-white border-slate-200 text-slate-400'
            }`}>
              {activeStep > 1 ? <Check className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <span className={`text-xs font-semibold ${activeStep === 1 ? 'text-brand-600' : 'text-slate-500'}`}>Contact & Profile</span>
          </button>

          {/* Step 2 Node */}
          <button 
            onClick={() => setActiveStep(2)}
            className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              activeStep > 2 ? 'bg-brand-500 border-brand-500 text-white' :
              activeStep === 2 ? 'bg-white border-brand-500 text-brand-600 ring-4 ring-brand-500/10' :
              'bg-white border-slate-200 text-slate-400'
            }`}>
              {activeStep > 2 ? <Check className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            </div>
            <span className={`text-xs font-semibold ${activeStep === 2 ? 'text-brand-600' : 'text-slate-500'}`}>Identity Proof</span>
          </button>

          {/* Step 3 Node */}
          <button 
            onClick={() => setActiveStep(3)}
            className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              statusData?.isDriverVerified ? 'bg-brand-500 border-brand-500 text-white' :
              activeStep === 3 ? 'bg-white border-brand-500 text-brand-600 ring-4 ring-brand-500/10' :
              'bg-white border-slate-200 text-slate-400'
            }`}>
              {statusData?.isDriverVerified ? <Check className="h-5 w-5" /> : <Car className="h-5 w-5" />}
            </div>
            <span className={`text-xs font-semibold ${activeStep === 3 ? 'text-brand-600' : 'text-slate-500'}`}>Driving Specs</span>
          </button>
        </div>
      </div>

      {/* STEP CONTENT PANELS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 transition-all duration-300">
        
        {/* STEP 1: CONTACT DETAILS */}
        {activeStep === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-brand-500" />
              <h3 className="text-lg font-bold text-slate-800">Personal Contact & Profile Details</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Having verified contact details increases booking request acceptances by 4x. We require verification of phone and email for safety.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Phone verification card */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Phone Number</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{user?.phone || 'Not added'}</p>
                    </div>
                  </div>
                  {user?.isPhoneVerified ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                      Pending
                    </span>
                  )}
                </div>

                {!user?.isPhoneVerified && (
                  <button
                    onClick={handleSimulatePhoneVerify}
                    disabled={phoneVerifying}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-3 rounded-xl mt-4 transition-colors disabled:opacity-50"
                  >
                    {phoneVerifying ? 'Verifying OTP...' : 'Verify Phone (Simulated)'}
                  </button>
                )}
              </div>

              {/* Email verification card */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Email Address</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                  {user?.isEmailVerified ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                      Pending
                    </span>
                  )}
                </div>

                {!user?.isEmailVerified && (
                  <button
                    onClick={handleSimulateEmailVerify}
                    disabled={emailVerifying}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-3 rounded-xl mt-4 transition-colors disabled:opacity-50"
                  >
                    {emailVerifying ? 'Sending link...' : 'Verify Email (Simulated)'}
                  </button>
                )}
              </div>

            </div>

            {/* Profile Check Info */}
            <div className="p-5 border border-indigo-50 bg-indigo-50/20 rounded-2xl flex gap-3 text-slate-600 text-sm mb-6">
              <HeartHandshake className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Ensure profile photo exists:</span> RideShareX matches profile pictures against government document uploads to ensure authenticity. Update your profile image, gender, and bio in your <a href="/profile" className="text-brand-600 font-semibold underline">Profile Settings</a> before uploading documents.
              </div>
            </div>

            <div className="flex justify-end mt-8 border-t border-slate-100 pt-6">
              <button
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/10"
              >
                Continue to ID Verification <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GOVERNMENT ID PROOF */}
        {activeStep === 2 && (
          <form onSubmit={handleIdentitySubmit}>
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-brand-500" />
              <h3 className="text-lg font-bold text-slate-800">Government Identity Proof Verification</h3>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              Upload a valid Indian Government ID card. Your name and document number must match. Supported ID forms: Aadhaar Card, PAN Card, Passport, Voter ID.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* ID Selector */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">ID Proof Type</label>
                <div className="space-y-2">
                  {['Aadhaar', 'PAN', 'Passport', 'VoterID'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      disabled={statusData?.isIdentityVerified || statusData?.verificationStatus === 'pending'}
                      onClick={() => setDocType(type)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        docType === type 
                          ? 'border-brand-500 bg-brand-50/50 text-brand-700 ring-2 ring-brand-500/10' 
                          : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {type} Card
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Number and Document Upload Area */}
              <div className="md:col-span-2 space-y-4">
                <DocumentUploadCard
                  title={`${docType} Details & Image`}
                  description={`Enter your ${docType} number and upload an image of the front side.`}
                  docNumber={docNumber}
                  onDocNumberChange={setDocNumber}
                  numberPlaceholder={`Enter ${docType} Number`}
                  uploadedUrl={docImage}
                  onUploadComplete={setDocImage}
                  status={activeDoc?.status || 'none'}
                  rejectionReason={activeDoc?.rejectionReason || ''}
                />
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex justify-between mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              
              {statusData?.isIdentityVerified || statusData?.verificationStatus === 'pending' ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Continue to Driver Specs <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/10 disabled:opacity-50"
                >
                  {submitting ? 'Submitting ID...' : 'Submit ID Document'}
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: DRIVER SPECIFICATIONS & VEHICLES */}
        {activeStep === 3 && (
          <form onSubmit={handleDriverSubmit}>
            <div className="flex items-center gap-2 mb-6">
              <Car className="h-5 w-5 text-brand-500" />
              <h3 className="text-lg font-bold text-slate-800">Become a Driver (Vehicle & Driving Specs)</h3>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              To publish a ride as a driver, Indian transportation safety norms require registering your driving license, vehicle Registration Certificate (RC), and active car insurance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* DL info */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">1. Driving License Verification</h4>
                <DocumentUploadCard
                  title="Driving License (DL)"
                  description="Enter DL Number and upload image"
                  docNumber={licenseNumber}
                  onDocNumberChange={setLicenseNumber}
                  numberPlaceholder="E.g. DL-1420110012345"
                  uploadedUrl={licenseImage}
                  onUploadComplete={setLicenseImage}
                  status={activeDriver?.status || 'none'}
                  rejectionReason={activeDriver?.rejectionReason || ''}
                />
              </div>

              {/* Vehicle RC info */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">2. Vehicle Registration Certificate (RC)</h4>
                <DocumentUploadCard
                  title="Vehicle RC Proof"
                  description="Enter Registration Number (car plate) & upload RC image"
                  docNumber={rcNumber}
                  onDocNumberChange={setRcNumber}
                  numberPlaceholder="E.g. TS09EX8888"
                  uploadedUrl={rcImage}
                  onUploadComplete={setRcImage}
                  status={activeDriver?.status || 'none'}
                  rejectionReason={activeDriver?.rejectionReason || ''}
                />
              </div>

              {/* Insurance upload */}
              <div className="space-y-4 md:col-span-1">
                <h4 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">3. Vehicle Insurance Cover</h4>
                <DocumentUploadCard
                  title="Insurance Document"
                  description="Upload valid vehicle insurance certificate"
                  uploadedUrl={insuranceImage}
                  onUploadComplete={setInsuranceImage}
                  status={activeDriver?.status || 'none'}
                  rejectionReason={activeDriver?.rejectionReason || ''}
                />
              </div>

              {/* Pollution certificate upload */}
              <div className="space-y-4 md:col-span-1">
                <h4 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">4. PUC Certificate (Optional)</h4>
                <DocumentUploadCard
                  title="Pollution Certificate (PUC)"
                  description="Upload latest pollution control document"
                  uploadedUrl={pollutionImage}
                  onUploadComplete={setPollutionImage}
                  required={false}
                  status={activeDriver?.status || 'none'}
                />
              </div>

              {/* Vehicle Configuration Specs */}
              <div className="md:col-span-2 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-700 text-sm mb-4">5. Vehicle Specifications (Will be shown to Co-travelers)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Vehicle Type</label>
                    <select
                      disabled={statusData?.isDriverVerified || activeDriver?.status === 'pending'}
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                    >
                      {['Sedan', 'SUV', 'Hatchback', 'Compact', 'Bike', 'Motorcycle', 'Scooter', 'Scooty', 'Other'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Vehicle Model Name</label>
                    <input
                      type="text"
                      disabled={statusData?.isDriverVerified || activeDriver?.status === 'pending'}
                      placeholder="E.g. Honda City / Swift Dzire"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Plate Registration Number</label>
                    <input
                      type="text"
                      disabled={statusData?.isDriverVerified || activeDriver?.status === 'pending'}
                      placeholder="E.g. AP 07 CR 4321"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Total Passenger Seats</label>
                    <input
                      type="number"
                      disabled={statusData?.isDriverVerified || activeDriver?.status === 'pending'}
                      min="1"
                      max="8"
                      value={seatsAvailable}
                      onChange={(e) => setSeatsAvailable(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Stepper Navigation */}
            <div className="flex justify-between mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {statusData?.isDriverVerified || activeDriver?.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Return to Overview <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/10 disabled:opacity-50"
                >
                  {submitting ? 'Submitting Drivers Specs...' : 'Submit Credentials'}
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
