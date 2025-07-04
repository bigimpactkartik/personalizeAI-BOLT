import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { ProjectFormData } from '../../types';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

interface UploadDataStepProps {
  formData: ProjectFormData;
  updateFormData: (updates: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const UploadDataStep: React.FC<UploadDataStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const requiredColumns = [
    { name: 'Email', required: true },
    { name: 'First Name', required: false },
    { name: 'Job Title', required: true },
    { name: 'Department', required: true, preferred: false },
    { name: 'Seniority', required: true },
    { name: 'Role', required: true },
    { name: 'Company', required: true },
    { name: 'Company Size', required: true },
    { name: 'Company Website', required: true },
    { name: 'LinkedIn Profile of Company', required: true }
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.dataSource === 'excel' && !formData.excelFile) {
      newErrors.excelFile = 'Please upload an Excel file';
    }

    if (formData.dataSource === 'googlesheet' && !formData.googleSheetLink?.trim()) {
      newErrors.googleSheetLink = 'Please provide a Google Sheet link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleDataSourceChange = (source: 'excel' | 'googlesheet') => {
    updateFormData({ 
      dataSource: source,
      excelFile: undefined,
      googleSheetLink: ''
    });
    setErrors({});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ excelFile: file });
      if (errors.excelFile) {
        setErrors(prev => ({ ...prev, excelFile: '' }));
      }
    }
  };

  const handleGoogleSheetChange = (value: string) => {
    updateFormData({ googleSheetLink: value });
    if (errors.googleSheetLink) {
      setErrors(prev => ({ ...prev, googleSheetLink: '' }));
    }
  };

  return (
    <div className="fade-in-up">
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Upload Data</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Provide your lead data to start the personalization process
          </p>
        </div>

        {/* Data Source Selection */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Choose Data Source</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-lg p-4 sm:p-6 cursor-not-allowed transition-all duration-300 opacity-50 ${
                formData.dataSource === 'excel'
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                <div>
                  <h4 className="font-semibold text-gray-500 text-sm sm:text-base">Upload Excel File</h4>
                  <p className="text-xs sm:text-sm text-gray-400">Upload a .xlsx or .csv file</p>
                  <p className="text-xs font-medium text-orange-600 mt-1">AVAILABLE SOON</p>
                </div>
              </div>
            </div>

            <div
              className={`border-2 rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                formData.dataSource === 'googlesheet'
                  ? 'border-blue-500 bg-blue-50 transform scale-105'
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              onClick={() => handleDataSourceChange('googlesheet')}
            >
              <div className="flex items-center space-x-3">
                <Link className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Google Sheet Link</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Provide a shareable link</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section - Disabled */}
        {formData.dataSource === 'excel' && (
          <div className="mb-6 sm:mb-8 slide-in">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Upload Excel File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 border-gray-200 bg-gray-50 opacity-50">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled
              />
              <label htmlFor="file-upload" className="cursor-not-allowed">
                <div>
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-base sm:text-lg font-medium text-gray-400">Excel Upload Coming Soon</p>
                  <p className="text-xs sm:text-sm text-gray-400">This feature will be available in the next update</p>
                  <p className="text-xs font-medium text-orange-600 mt-2">AVAILABLE SOON</p>
                </div>
              </label>
            </div>
            <p className="mt-2 text-sm text-orange-600">
              Excel file upload functionality is currently under development and will be available soon.
            </p>
          </div>
        )}

        {/* Google Sheet Link Section */}
        {formData.dataSource === 'googlesheet' && (
          <div className="mb-6 sm:mb-8 slide-in">
            <Input
              label="Google Sheet Link"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={formData.googleSheetLink || ''}
              onChange={(e) => handleGoogleSheetChange(e.target.value)}
              error={errors.googleSheetLink}
              helperText="Make sure the sheet is publicly accessible or shared with view permissions"
              required
            />
          </div>
        )}

        {/* Required Columns Info */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Required Columns</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-200">
            <div className="flex items-start space-x-2 mb-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-900">
                  Please ensure your data includes the following columns:
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requiredColumns.map((column, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    column.required ? 'bg-red-500' : column.preferred ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className={`text-xs sm:text-sm ${
                    column.required ? 'font-medium text-gray-900' : column.preferred ? 'font-medium text-yellow-700' : 'text-gray-700'
                  }`}>
                    {column.name} {column.required && <span className="text-red-500">*</span>} {column.preferred && '(Preferred)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" onClick={handlePrevious} className="w-full sm:w-auto transition-all duration-200">
            Previous
          </Button>
          <Button 
            onClick={handleNext} 
            size="lg" 
            className="w-full sm:w-auto transition-all duration-200"
            disabled={formData.dataSource === 'excel'}
          >
            Next: Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UploadDataStep;