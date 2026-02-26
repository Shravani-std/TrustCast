import React, { useState } from "react";
import { BookOpen, HelpCircle, FileText, ChevronDown } from "lucide-react";

const HelpDocs = () => {
  const [activeTab, setActiveTab] = useState("help");
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What file format should I upload?",
      answer:
        "Upload a CSV file containing the same features as the original dataset used for training the TrustCast model."
    },
    {
      question: "How does anomaly detection work?",
      answer:
        "The system uses a BiGRU-Attention model to analyze time-series patterns and assign anomaly scores."
    },
    {
      question: "What is Trust Score?",
      answer:
        "Trust Score represents entity reliability based on historical anomaly behavior."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen className="text-indigo-600" />
            Help & Documentation
          </h2>
          <p className="text-slate-500 mt-2">
            Learn how to use TrustCast effectively.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b pb-4 mb-6">
          <button
            onClick={() => setActiveTab("help")}
            className={`flex items-center gap-2 ${
              activeTab === "help"
                ? "text-indigo-600 font-semibold"
                : "text-slate-500"
            }`}
          >
            <HelpCircle size={18} />
            Help
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-2 ${
              activeTab === "docs"
                ? "text-indigo-600 font-semibold"
                : "text-slate-500"
            }`}
          >
            <FileText size={18} />
            Documentation
          </button>
        </div>

        {/* Help Section */}
        {activeTab === "help" && (
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 hover:shadow-md transition"
              >
                <div
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex justify-between items-center cursor-pointer"
                >
                  <h4 className="font-medium text-slate-700">
                    {item.question}
                  </h4>
                  <ChevronDown
                    className={`transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {openIndex === index && (
                  <p className="mt-3 text-slate-500">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Documentation Section */}
        {activeTab === "docs" && (
          <div className="space-y-6 text-slate-600">
            <div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">
                1. Data Upload
              </h4>
              <p>
                Ensure your dataset matches the training schema. Missing or extra columns may cause prediction errors.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">
                2. Preprocessing Pipeline
              </h4>
              <p>
                Data is scaled using a pre-trained scaler (scaler.pkl) before passing into the BiGRU-Attention model.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">
                3. Model Output
              </h4>
              <p>
                The system outputs anomaly probability, classification label, and Trust Score.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpDocs;