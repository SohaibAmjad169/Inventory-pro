import { useState } from 'react';
import { professionalPOSAPI } from '../api/professional-pos';
import { SmartText, useSmartPlaceholder } from '../i18n/smartTranslation';

interface ManagerOverrideModalProps {
  sessionId: string;
  overrideType: string;
  onApproved: () => void;
  onClose: () => void;
  message?: string;
}

export const ManagerOverrideModal: React.FC<ManagerOverrideModalProps> = ({
  sessionId,
  overrideType,
  onApproved,
  onClose,
  message,
}) => {
  // Smart placeholders
  const placeholder1 = useSmartPlaceholder('Enter manager username');
  const placeholder2 = useSmartPlaceholder('Enter PIN');
  const placeholder3 = useSmartPlaceholder('Enter additional details...');

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [reasonCode, setReasonCode] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Manager username is required');
      return;
    }

    if (!pin.trim()) {
      setError('PIN is required');
      return;
    }

    if (!reasonCode.trim()) {
      setError('Reason code is required');
      return;
    }

    setIsProcessing(true);

    try {
      await professionalPOSAPI.discountOverride.approveOverride({
        approver_username: username.trim(),
        approver_pin: pin.trim(),
        session_id: sessionId,
        override_type: overrideType,
        reason_code: reasonCode.trim(),
        reason_detail: reasonDetail.trim() || undefined,
      });

      onApproved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Override failed. Please check username and PIN.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <SmartText tag="h3" className="text-2xl font-bold">Manager Override Required</SmartText>
              <SmartText tag="p" className="text-yellow-100 text-sm">Authorization needed to proceed</SmartText>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Message */}
          {message && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
              <SmartText tag="p" className="font-semibold">Override Required:</SmartText>
              <p>{message}</p>
            </div>
          )}

          {/* Manager Username */}
          <div>
            <SmartText tag="label" className="block text-sm font-semibold text-gray-700 mb-2">Manager Username *</SmartText>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder={placeholder1}
              autoFocus
            />
          </div>

          {/* Manager PIN */}
          <div>
            <SmartText tag="label" className="block text-sm font-semibold text-gray-700 mb-2">Manager PIN *</SmartText>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder={placeholder2}
            />
          </div>

          {/* Reason Code */}
          <div>
            <SmartText tag="label" className="block text-sm font-semibold text-gray-700 mb-2">Reason Code *</SmartText>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Select reason...</option>
              <option value="EXCEED_DISCOUNT">Exceeded Discount Limit</option>
              <option value="PRICE_OVERRIDE">Price Override</option>
              <option value="VOID_TRANSACTION">Void Transaction</option>
              <option value="LARGE_REFUND">Large Refund</option>
              <option value="SYSTEM_ERROR">System Error</option>
              <option value="CUSTOMER_REQUEST">Customer Request</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Reason Detail */}
          <div>
            <SmartText tag="label" className="block text-sm font-semibold text-gray-700 mb-2">Additional Details (Optional)</SmartText>
            <textarea
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder={placeholder3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve Override
                </>
              )}
            </button>
            <button type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"><SmartText>Cancel</SmartText></button>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <SmartText tag="p" className="font-semibold mb-1">ℹ️ Manager Override</SmartText>
            <SmartText tag="p">Only managers (Admin/Owner) with override permissions can approve this action. The override will be logged in the audit trail.</SmartText>
          </div>
        </form>
      </div>
    </div>
  );
};





