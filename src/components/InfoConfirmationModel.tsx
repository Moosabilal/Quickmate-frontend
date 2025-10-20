import React from "react";
import { X, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { InfoModalProps } from "../util/interface/IDeleteModelType";

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  type = "INFO",
  title,
  message,
  additionalInfo,
  confirmText = "Got it",
}) => {
  if (!isOpen) return null;

  const configs = {
    INFO: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      iconBg: "bg-blue-100",
      title: title || "Information",
    },
    SUCCESS: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      iconBg: "bg-green-100",
      title: title || "Success",
    },
    WARNING: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      title: title || "Warning",
    },
  };

  const config = configs[type];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>{config.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">
              {config.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
          {additionalInfo && (
            <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">
              {additionalInfo}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
