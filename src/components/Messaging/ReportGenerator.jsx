import React, { useState, useEffect } from 'react';
import { generatePatientReport, getReportTypes, REPORT_TYPES } from '@/utils/reportGeneration';
import { logProviderAction, ACTION_TYPES } from '@/utils/auditLogging';

/**
 * ReportGenerator Component
 * Interface for creating patient reports
 */
const ReportGenerator = ({ 
  patientId = 'PA-001', 
  patientName = 'Patient',
  providerId = 'provider-123',
  onReportGenerated = null 
}) => {
  const [step, setStep] = useState(1); // 1: select type, 2: configure, 3: preview
  const [reportType, setReportType] = useState(REPORT_TYPES.COMPREHENSIVE);
  const [reportTypes, setReportTypes] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportTitle, setReportTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeMedications, setIncludeMedications] = useState(true);
  const [includeLabResults, setIncludeLabResults] = useState(true);
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load report types on mount
  useEffect(() => {
    loadReportTypes();
  }, []);

  // Load report types
  const loadReportTypes = async () => {
    try {
      const types = await getReportTypes();
      setReportTypes(types);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load report types');
      console.error('Report types loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      const options = {
        reportType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        includeHistory,
        includeMedications,
        includeLabResults,
        format
      };

      const report = await generatePatientReport(patientId, options);
      setGeneratedReport(report);
      setStep(3); // Move to preview

      // Log action
      await logProviderAction(providerId, ACTION_TYPES.REPORT_GENERATED, patientId, {
        reportType,
        format
      });

      if (onReportGenerated) {
        onReportGenerated(report);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Download report
  const handleDownloadReport = async () => {
    if (!generatedReport) return;

    try {
      // Simulate download
      const fileName = `${patientName}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Downloading:', fileName);

      await logProviderAction(providerId, ACTION_TYPES.REPORT_DOWNLOADED, patientId, {
        reportId: generatedReport.id
      });

      alert(`Report "${generatedReport.title}" would be downloaded as ${fileName}`);
    } catch (err) {
      setError(err.message || 'Failed to download report');
    }
  };

  // Share report
  const handleShareReport = async () => {
    if (!generatedReport) return;

    try {
      await logProviderAction(providerId, ACTION_TYPES.REPORT_SHARED, patientId, {
        reportId: generatedReport.id
      });

      alert(`Report shared with patient ${patientName}`);
    } catch (err) {
      setError(err.message || 'Failed to share report');
    }
  };

  // Print report
  const handlePrintReport = () => {
    window.print();
  };

  // Reset form
  const handleReset = () => {
    setStep(1);
    setReportType(REPORT_TYPES.COMPREHENSIVE);
    setReportTitle('');
    setNotes('');
    setGeneratedReport(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="report-generator loading">
        <div className="loading-spinner"></div>
        <p>Loading report options...</p>
      </div>
    );
  }

  return (
    <div className="report-generator">
      {/* Header */}
      <div className="generator-header">
        <h2>Generate Report</h2>
        <p className="patient-info">Patient: {patientName}</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-text">❌ {error}</span>
          <button
            onClick={() => setError(null)}
            className="close-btn"
          >
            ✕
          </button>
        </div>
      )}

      {/* Step 1: Select Report Type */}
      {step === 1 && (
        <div className="generator-step step-1">
          <h3>Select Report Type</h3>
          <div className="report-types-grid">
            {reportTypes.map((type) => (
              <div
                key={type.id}
                className={`report-type-card ${reportType === type.id ? 'selected' : ''}`}
                onClick={() => setReportType(type.id)}
              >
                <div className="type-icon">{type.icon}</div>
                <h4>{type.name}</h4>
                <p>{type.description}</p>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button
              onClick={() => setStep(2)}
              className="next-btn"
              disabled={!reportType}
            >
              Next: Configure
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure Report */}
      {step === 2 && (
        <div className="generator-step step-2">
          <h3>Configure Report</h3>

          <div className="form-group">
            <label>Report Title</label>
            <input
              type="text"
              placeholder="Enter report title (optional)"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="form-select"
            >
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="form-group">
            <h4>Include in Report</h4>
            <div className="checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeHistory}
                  onChange={(e) => setIncludeHistory(e.target.checked)}
                />
                Patient History
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeMedications}
                  onChange={(e) => setIncludeMedications(e.target.checked)}
                />
                Medications
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeLabResults}
                  onChange={(e) => setIncludeLabResults(e.target.checked)}
                />
                Lab Results
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              placeholder="Add any additional notes to include in the report..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="step-actions">
            <button
              onClick={() => setStep(1)}
              className="back-btn"
            >
              Back
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="generate-btn"
            >
              {generating ? '⏳ Generating...' : '✓ Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Report Preview */}
      {step === 3 && generatedReport && (
        <div className="generator-step step-3">
          <h3>Report Preview</h3>

          <div className="report-preview">
            <div className="preview-header">
              <h4>{generatedReport.title}</h4>
              <p className="preview-date">
                Generated: {new Date(generatedReport.generatedDate).toLocaleDateString()}
              </p>
            </div>

            <div className="preview-content">
              <div className="preview-section">
                <h5>Patient Information</h5>
                <p><strong>Name:</strong> {generatedReport.data.patientName}</p>
                <p><strong>Age:</strong> {generatedReport.data.age}</p>
                <p><strong>Conditions:</strong> {generatedReport.data.conditions.join(', ')}</p>
              </div>

              <div className="preview-section">
                <h5>Report Details</h5>
                <p><strong>Format:</strong> {generatedReport.format.toUpperCase()}</p>
                <p><strong>Pages:</strong> {generatedReport.pages}</p>
                <p><strong>Sections:</strong> {generatedReport.sections.length}</p>
                <p><strong>Status:</strong> {generatedReport.status}</p>
              </div>

              {notes && (
                <div className="preview-section">
                  <h5>Notes</h5>
                  <p>{notes}</p>
                </div>
              )}
            </div>

            <div className="preview-actions">
              <button onClick={handlePrintReport} className="action-btn print-btn">
                🖨️ Print
              </button>
              <button onClick={handleDownloadReport} className="action-btn download-btn">
                ⬇️ Download
              </button>
              <button onClick={handleShareReport} className="action-btn share-btn">
                🔗 Share
              </button>
            </div>
          </div>

          <div className="step-actions">
            <button onClick={handleReset} className="reset-btn">
              Generate Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
