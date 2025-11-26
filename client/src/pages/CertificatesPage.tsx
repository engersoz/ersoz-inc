import React, { useState } from 'react';
import { Award, CheckCircle, Shield, X } from 'lucide-react';

const CertificatesPage: React.FC = () => {
  const [selectedCert, setSelectedCert] = useState<number | null>(null);

  const certificates = [
    {
      id: 1,
      title: 'EUROLAB Test Report',
      subtitle: 'Laboratory Test Results',
      description: 'Comprehensive testing for Glass Mosaic Tiles including Chlorine Resistance, Freeze Resistance, and UV Resistance tests.',
      issuer: 'EUROLAB - Türcert Teknik Kontrol ve Belgelendirme A.Ş.',
      date: 'April 30, 2019',
      status: 'PASSED',
      tests: [
        { name: 'Chlorine Resistance Test', method: 'ASTM C650-4', result: 'PASSED' },
        { name: 'Freeze Resistance Test', method: 'ASTM C1026-13', result: 'PASSED' },
        { name: 'UV Resistance Test', method: 'ISO 4892', result: 'PASSED' }
      ],
      image: '/certificates/eurolab-test-report.jpg',
      color: 'blue'
    },
    {
      id: 2,
      title: 'ISO 9001:2015',
      subtitle: 'Quality Management System',
      description: 'Certified for Production and Sales of Mosaic. The Quality Management System is applicable to all manufacturing and sales operations.',
      issuer: 'IQR International Certification',
      date: 'Valid until October 8, 2023',
      certNumber: 'QMS-11397/01',
      image: '/certificates/iso-9001-certificate.jpg',
      color: 'green'
    },
    {
      id: 3,
      title: 'ISO 14001:2015',
      subtitle: 'Environmental Management System',
      description: 'Certified Environmental Management System for Production and Sales of Mosaic, ensuring sustainable and eco-friendly practices.',
      issuer: 'IQR International Certification',
      date: 'Valid until October 8, 2023',
      certNumber: 'EMS-11397/01',
      image: '/certificates/iso-14001-certificate.jpg',
      color: 'emerald'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-sky-600 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
              <Award className="w-10 h-10" />
            </div>
            <h1 className="heading-1 mb-4">Our Certifications</h1>
            <p className="text-xl text-blue-100 mb-8">
              Quality assurance through internationally recognized certifications and rigorous testing standards
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>ISO Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Lab Tested</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Quality Credentials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We maintain the highest standards in manufacturing and environmental practices, 
              certified by internationally recognized organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => setSelectedCert(cert.id)}
              >
                {/* Certificate Preview Image */}
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br from-${cert.color}-500 to-${cert.color}-600 opacity-10`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-32 h-32 bg-${cert.color}-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Award className={`w-16 h-16 text-${cert.color}-600`} />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 bg-${cert.color}-500 text-white text-xs font-semibold rounded-full`}>
                      Certified
                    </span>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{cert.title}</h3>
                  <p className={`text-sm font-semibold text-${cert.color}-600 mb-3`}>{cert.subtitle}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{cert.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Issuer:</span>
                      <span className="font-semibold text-gray-700 text-right text-xs">{cert.issuer.split(' ')[0]}</span>
                    </div>
                    {cert.certNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Certificate #:</span>
                        <span className="font-semibold text-gray-700">{cert.certNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-semibold text-gray-700 text-xs">{cert.date}</span>
                    </div>
                  </div>

                  {cert.tests && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Test Results:</p>
                      {cert.tests.map((test, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="line-clamp-1">{test.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className={`w-full mt-4 py-2 bg-gradient-to-r from-${cert.color}-500 to-${cert.color}-600 text-white rounded-lg hover:shadow-lg transition-all`}>
                    View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Certifications Matter */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-2 text-center mb-12">Why Our Certifications Matter</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Quality Assurance</h3>
                <p className="text-gray-600 text-sm">
                  Rigorous testing ensures every product meets international quality standards
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Proven Reliability</h3>
                <p className="text-gray-600 text-sm">
                  Our mosaics pass chlorine, freeze, and UV resistance tests with flying colors
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Environmental Care</h3>
                <p className="text-gray-600 text-sm">
                  ISO 14001 certification demonstrates our commitment to sustainable practices
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for full certificate view */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCert(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">
                  {certificates.find(c => c.id === selectedCert)?.title}
                </h3>
                <p className="text-gray-600 mt-2">
                  Click image to view in detail (certificates will be added as images)
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500">Certificate image placeholder</p>
                <p className="text-sm text-gray-400 mt-2">Upload actual certificate images to /public/certificates/</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
