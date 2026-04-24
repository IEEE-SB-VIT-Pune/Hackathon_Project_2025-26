import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import FaqItem from '../../components/faq/FaqItem';
import '../../styles/faq.css';

const Faq = () => {
  const { user } = useAuth();

  // Determine user role
  const getUserRole = () => {
    if (!user) return 'user';
    if (user.systemRole === 'admin') return 'admin';
    if (user.hackathonRoles?.some(role => role.role === 'judge')) return 'judge';
    return 'user';
  };

  const role = getUserRole();

  // FAQ Data
  const adminFaqs = [
    {
      question: "How do I create and manage a new hackathon?",
      answer: "Admins can create new hackathons from the admin dashboard by specifying details like schedule, rules, and problem statements. You can also edit active hackathon details, update timelines, and manage participant registrations."
    },
    {
      question: "Can I manage user roles and permissions?",
      answer: "Yes, Admins have the authority to view all registered users and assign specific roles, such as upgrading a regular user to an Organizer or a Judge."
    },
    {
      question: "How do I upload problem statements for a hackathon?",
      answer: "Admins (and organizers) can create problem statements manually or upload metadata containing domains, complexity, and descriptions. These are automatically processed by our AI Recommendation Engine to map them to participant skills."
    },
    {
      question: "How do I monitor ongoing hackathon discussions?",
      answer: "The platform features real-time Socket.IO-powered discussions. Admins receive special badges in the chat and can monitor and moderate all public hackathon discussion rooms or threaded conversations."
    },
    {
      question: "How is the final scoring calculated?",
      answer: "The system automatically normalizes and aggregates scores submitted by judges. Admins can view the real-time leaderboard and the final aggregated results once the evaluation phase is completed."
    }
  ];

  const judgeFaqs = [
    {
      question: "How do I access the submissions mapped to me?",
      answer: "Once the submission phase ends, you can navigate to the \"Evaluations\" dashboard. Submissions are allocated to you based on your domain expertise, and you can view all project links, videos, and documentation submitted by the teams."
    },
    {
      question: "What criteria are used to evaluate a submission?",
      answer: "Submissions are evaluated using a combination of checkbox scoring (fulfillment of mandatory requirements) and customized grading metrics (such as Innovation, Technical Complexity, and Presentation). You will find rubrics attached to every team output."
    },
    {
      question: "How do I communicate with a team if I need clarification?",
      answer: "You can use the real-time discussion system to ask questions. Your messages will appear with a priority \"Judge\" badge, allowing teams to quickly identify and respond to your queries."
    },
    {
      question: "Can I edit my evaluation scores after saving?",
      answer: "Yes, scores can be edited and re-submitted as long as the global evaluation phase is still active. Once the Admin locks the judging phase, scores become final and cannot be modified."
    }
  ];

  const userFaqs = [
    {
      question: "How do I find the right teammates for my hackathon idea?",
      answer: "You can use our Tag-based Teammate Search. The platform allows you to search for users based on their skills (e.g., React, Python, UI/UX), interests, bio, and department. The system returns a match-score indicating how well their skills align with what you need."
    },
    {
      question: "I don't know what problem to solve. Can the platform help?",
      answer: "Yes! Our platform features an AI Recommendation System. Once your team profile is complete, the engine uses Natural Language Processing (NLP) to extract your team's collective skills and matches them semantically against available problem statements, recommending the best ones for your skill set."
    },
    {
      question: "How do I create or join a team?",
      answer: "You can create a team from your participant dashboard and invite members using their usernames or email. Alternatively, you can accept team invitations sent to you by other team leaders."
    },
    {
      question: "How do I submit my final project?",
      answer: "Go to the \"Submissions\" tab within your active hackathon. The team leader can submit the project repository link, a demo video link, and any required documentation before the hackathon deadline."
    },
    {
      question: "How do I sign into the platform?",
      answer: "You can sign up using an email and password, or you can use our OAuth integration to log in quickly and securely with your GitHub or Google account."
    },
    {
      question: "Where can I see the hackathon schedule and my upcoming deadlines?",
      answer: "You can check the unified Calendar feature, which displays all important phases of the hackathons you are participating in, such as Registration Deadlines, Hacking Phase, and Submission Deadlines."
    }
  ];

  // Select FAQs based on role
  const getFaqs = () => {
    switch (role) {
      case 'admin':
        return { title: 'Admin FAQs', faqs: adminFaqs, color: '#ef4444' };
      case 'judge':
        return { title: 'Judge FAQs', faqs: judgeFaqs, color: '#f59e0b' };
      default:
        return { title: 'User FAQs', faqs: userFaqs, color: '#4f9cf9' };
    }
  };

  const { title, faqs, color } = getFaqs();

  return (
    <div className="faq-page">
      <Navbar />
      
      <div className="faq-container">
        <div className="faq-header">
          <div className="faq-badge" style={{ background: `${color}15`, color: color }}>
            {role === 'admin' ? '🔴 Admin' : role === 'judge' ? '🟡 Judge' : '🔵 User'}
          </div>
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            {role === 'admin' 
              ? 'Everything you need to know about managing hackathons on HackHub'
              : role === 'judge'
              ? 'Your guide to evaluating submissions and scoring teams'
              : 'Get answers to common questions about participating in hackathons'}
          </p>
        </div>

        <div className="faq-content">
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <FaqItem 
                key={index} 
                question={faq.question} 
                answer={faq.answer}
                color={color}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Faq;
