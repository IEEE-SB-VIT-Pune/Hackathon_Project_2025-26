import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">About Us</h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          {/* Platform Explanation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">The Hackathon Platform</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              This platform is a comprehensive, end-to-end Hackathon Management System designed to bridge the gap between ideation and execution. Our goal is to streamline the entire hackathon lifecycle for all stakeholders involved:
            </p>
            
            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl">•</span>
                <p className="text-slate-600">
                  <strong className="text-slate-800">For Students & Participants:</strong> A unified dashboard to discover upcoming hackathons, form complementary teams, submit project prototypes, and track important deadlines seamlessly.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl">•</span>
                <p className="text-slate-600">
                  <strong className="text-slate-800">For Admins & Organizers:</strong> Powerful tools to effortlessly create new hackathon events, manage registrations, define evaluation rubrics, and dynamically assign expert judges to specific tracks.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl">•</span>
                <p className="text-slate-600">
                  <strong className="text-slate-800">For Judges:</strong> Dedicated portals to access assigned hackathons, review team submissions efficiently, and provide structured scores and constructive feedback to participants.
                </p>
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Ultimately, this platform acts as an integrated hub that connects builders, mentors, and administrators to foster a thriving culture of innovation and collaborative problem-solving.
            </p>
          </section>

          {/* Org Explanation */}
          <section className="mb-12 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Who We Are</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              This project was passionately crafted and architected by the <strong className="text-slate-900">IEEE Student Branch (IEEE SB) of VIT Pune</strong>. 
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              With a proud legacy spanning over <strong className="text-blue-600 font-semibold">26 years</strong>, we stand as one of the oldest, largest, and most prestigious student-run technical clubs at Vishwakarma Institute of Technology (VIT). 
            </p>
            <p className="text-slate-500 text-sm italic">
              *Please note that we are the premier and primary IEEE Student Branch at VIT Pune, completely distinct from other IEEE affinity chapters within the college.*
            </p>
          </section>

          {/* Developers CTA */}
          <section className="text-center pt-8 border-t border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Want to see the brilliant minds behind this code?</h3>
            <Link 
              to="/developers" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow"
            >
              Meet the Developers &rarr;
            </Link>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;