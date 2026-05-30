import React, { useState } from "react";
import {
  BookOpen,
  HelpCircle,
  FileText,
  ChevronDown,
  ShieldCheck,
  Upload,
  BrainCircuit,
  Database,
  Activity,
  Cpu,
  BarChart3,
} from "lucide-react";

const HelpDocs = () => {
  const [activeTab, setActiveTab] = useState("help");
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is TrustCast?",
      answer:
        "TrustCast is an AI-powered cyber anomaly detection and trust analysis platform that detects suspicious network activity using deep learning and generates trust scores for entities."
    },
    {
      question: "What file format should I upload?",
      answer:
        "Upload a CSV dataset containing the same columns used during model training such as srcip, dstip, sport, dsport, proto, dur, sbytes, dbytes, Label, attack_cat and other network traffic features."
    },
    {
      question: "How does anomaly detection work?",
      answer:
        "TrustCast uses a BiGRU-Attention deep learning model to analyze network traffic patterns, detect abnormal behavior, and classify malicious activity."
    },
    {
      question: "What is Trust Score?",
      answer:
        "Trust Score represents the reliability and behavioral safety of a network entity based on anomaly history, traffic behavior, and prediction confidence."
    },
    {
      question: "What attacks can TrustCast detect?",
      answer:
        "The system can identify attacks such as DoS, DDoS, Reconnaissance, Fuzzers, Exploits, Generic attacks, Backdoors, Worms, and suspicious network anomalies."
    },
    {
      question: "How are predictions generated?",
      answer:
        "Uploaded traffic data is preprocessed, scaled using scaler.pkl, converted into sequences, and passed through the trained BiGRU-Attention model for prediction."
    },
    {
      question: "What technologies are used in TrustCast?",
      answer:
        "Frontend: React + Tailwind CSS | Backend: FastAPI | AI Model: TensorFlow/Keras | Database: MongoDB | Visualization: Power BI."
    },
    {
      question: "Why is preprocessing important?",
      answer:
        "Preprocessing removes inconsistencies, scales numeric values, handles missing data, and converts categorical features into machine-readable format for accurate predictions."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* HERO SECTION */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 md:p-12 text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={40} />
              <h1 className="text-4xl md:text-5xl font-bold">
                TrustCast
              </h1>
            </div>

            <p className="text-lg md:text-xl text-indigo-100 max-w-3xl leading-relaxed">
              AI-powered anomaly detection and cyber trust analysis system
              designed to monitor network traffic, identify malicious behavior,
              and generate intelligent trust scores using deep learning.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <BrainCircuit className="mb-2" />
                <h3 className="font-semibold">Deep Learning</h3>
                <p className="text-sm text-indigo-100">
                  BiGRU + Attention
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Activity className="mb-2" />
                <h3 className="font-semibold">Anomaly Detection</h3>
                <p className="text-sm text-indigo-100">
                  Real-time analysis
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <BarChart3 className="mb-2" />
                <h3 className="font-semibold">Trust Score</h3>
                <p className="text-sm text-indigo-100">
                  Intelligent scoring
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Database className="mb-2" />
                <h3 className="font-semibold">Network Dataset</h3>
                <p className="text-sm text-indigo-100">
                  UNSW-NB15
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-8">

          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <BookOpen className="text-indigo-600" />
              Help & Documentation
            </h2>

            <p className="text-slate-500 mt-3 dark:text-slate-400 text-lg">
              Complete guide for using the TrustCast cyber anomaly detection system.
            </p>
          </div>

          {/* TABS */}
          <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 pb-4 mb-8 overflow-x-auto">

            <button
              onClick={() => setActiveTab("help")}
              className={`flex items-center gap-2 transition-all duration-300 ${
                activeTab === "help"
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              <HelpCircle size={18} />
              Help
            </button>

            <button
              onClick={() => setActiveTab("docs")}
              className={`flex items-center gap-2 transition-all duration-300 ${
                activeTab === "docs"
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              <FileText size={18} />
              Documentation
            </button>
          </div>

          {/* HELP SECTION */}
          {activeTab === "help" && (
            <div className="space-y-5">
              {faqs.map((item, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <div
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-lg">
                      {item.question}
                    </h4>

                    <ChevronDown
                      className={`transition-transform duration-300 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {openIndex === index && (
                    <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* DOCUMENTATION */}
          {activeTab === "docs" && (
            <div className="space-y-8 text-slate-600 dark:text-slate-300">

              {/* SECTION 1 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="text-indigo-600" />
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    1. Data Upload
                  </h4>
                </div>

                <p className="leading-relaxed">
                  Upload a CSV dataset containing network traffic features.
                  Ensure the dataset follows the same schema used during model training.
                </p>

                <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <h5 className="font-semibold mb-2 text-indigo-600">
                    Required Columns:
                  </h5>

                  <p className="text-sm leading-7">
                    srcip, sport, dstip, dsport, proto, state, dur,
                    sbytes, dbytes, sttl, dttl, service, Sload,
                    Dload, Spkts, Dpkts, tcprtt, synack,
                    ackdat, attack_cat, Label
                  </p>
                </div>
              </div>

              {/* SECTION 2 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="text-purple-600" />
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    2. AI Processing Pipeline
                  </h4>
                </div>

                <div className="space-y-4 leading-relaxed">
                  <p>
                    TrustCast follows a multi-stage AI pipeline:
                  </p>

                  <ul className="list-disc pl-6 space-y-2">
                    <li>Dataset validation and preprocessing</li>
                    <li>Missing value handling</li>
                    <li>Feature scaling using scaler.pkl</li>
                    <li>Sequence generation for time-series learning</li>
                    <li>BiGRU-Attention model inference</li>
                    <li>Anomaly probability calculation</li>
                    <li>Trust score generation</li>
                  </ul>
                </div>
              </div>

              {/* SECTION 3 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <BrainCircuit className="text-pink-600" />
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    3. Deep Learning Architecture
                  </h4>
                </div>

                <div className="space-y-4 leading-relaxed">
                  <p>
                    The TrustCast AI engine is based on a BiGRU-Attention neural network.
                  </p>

                  <ul className="list-disc pl-6 space-y-2">
                    <li>BiGRU captures bidirectional traffic patterns</li>
                    <li>Attention layer focuses on important anomalies</li>
                    <li>Dense layers perform classification</li>
                    <li>Sigmoid/Softmax activation generates predictions</li>
                  </ul>
                </div>
              </div>

              {/* SECTION 4 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="text-red-600" />
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    4. Attack Detection
                  </h4>
                </div>

                <p className="leading-relaxed mb-4">
                  TrustCast can identify multiple cyber threats and anomalies.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "DoS Attacks",
                    "DDoS Attacks",
                    "Reconnaissance",
                    "Fuzzers",
                    "Exploits",
                    "Backdoors",
                    "Generic Malware",
                    "Worms",
                  ].map((attack, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
                    >
                      {attack}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="text-green-600" />
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    5. Model Output
                  </h4>
                </div>

                <div className="space-y-4 leading-relaxed">
                  <p>
                    After analysis, TrustCast generates:
                  </p>

                  <ul className="list-disc pl-6 space-y-2">
                    <li>Anomaly Probability Score</li>
                    <li>Attack Classification Label</li>
                    <li>Trust Score</li>
                    <li>Threat Severity</li>
                    <li>Traffic Behavior Insights</li>
                  </ul>
                </div>
              </div>

              {/* SECTION 6 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="text-blue-600" />
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    6. Technology Stack
                  </h4>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "React.js Frontend",
                    "Tailwind CSS UI",
                    "TensorFlow / Keras",
                    "Python Backend",
                    "FastAPI APIs",
                    "MongoDB",
                    "Power BI Visualizations",
                    "Deep Learning Models",
                  ].map((tech, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpDocs;