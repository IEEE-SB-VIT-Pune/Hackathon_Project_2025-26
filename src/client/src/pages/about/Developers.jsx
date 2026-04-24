import React from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const imageModules = import.meta.glob('../../assets/photo/*.*', { eager: true });

const importAll = (modules) => {
  let images = {};

  for (const path in modules) {

    const fileName = path.split('/').pop();
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    images[nameWithoutExt] = modules[path].default || modules[path];
  }

  return images;
};

const images = importAll(imageModules);

console.log(images);


// TODO: User - Fill out these developer details!
const developers = [
  {
    id: 1,
    name: "Prathmesh Toke",
    role: "Full Stack Developer",
    github: "https://github.com/Prathmesh1312",
    linkedin: "https://www.linkedin.com/in/toke-prathmesh",
    image: "/src/assets/photo/Prathmesh%20Toke.png"
  },
  {
    id: 2,
    name: "Ojas Manchanda",
    role: "Full Stack Developer",
    github: "https://github.com/OjasManchanda",
    linkedin: "https://www.linkedin.com/in/ojas-manchanda-981a74329/",
    image: "/src/assets/photo/Ojas%20Manchanda.png"
  },
  {
    id: 3,
    name: "Vedant Mishra",
    role: "Full Stack Developer",
    github: "https://github.com/VedantM47",
    linkedin: "https://www.linkedin.com/in/VedantM47",
    image: "/src/assets/photo/Vedant%20Mishra.png"
  },
  {
    id: 4,
    name: "Sanika Brahmankar",
    role: "Full Stack Developer",
    github: "https://github.com/Sanika-26054",
    linkedin: "https://www.linkedin.com/in/sanika-brahmankar-366a6b317",
    image: "/src/assets/photo/Sanika%20Brahmankar.png"
  },
  {
    id: 5,
    name: "Yash Wadhwani",
    role: "Full Stack Developer",
    github: "https://github.com/Yashu10-wq",
    linkedin: "https://www.linkedin.com/in/yash-wadhwani-2a38a6348/",
    image: "/src/assets/photo/Yash%20Wadhwani.png"
  },
  {
    id: 6,
    name: "Shalvi Maheshwari",
    role: "AI Features Developer",
    github: "https://github.com/shalvi1125",
    linkedin: "https://www.linkedin.com/in/shalvi-maheshwari-59b289339/",
    image: "/src/assets/photo/Shalvi%20Maheshwari.png"
  },
  {
    id: 7,
    name: "Siddhant Belkhede",
    role: "AI Features Developer",
    github: "https://github.com/SiddhantBelkhede",
    linkedin: "https://www.linkedin.com/in/siddhantbelkhede/",
    image: "/src/assets/photo/Siddhant%20Belkhed.png"
  },
  {
    id: 8,
    name: "Nirmit Hatti",
    role: "AI Features Developer",
    github: "https://github.com/nirmit070707",
    linkedin: "https://www.linkedin.com/in/nirmit-hatti-3b548a220?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    image: "/src/assets/photo/Nirmit%20Hatti.png"
  },
  {
    id: 9,
    name: "Tanaya Hartalekar",
    role: "AI Features Developer",
    github: "https://github.com/tanaya1806",
    linkedin: "https://www.linkedin.com/in/tanaya-hartalekar-225279340?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    image: "/src/assets/photo/Tanaya%20Hartalekar.png"
  }
];

const Developers = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Meet the Builders</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The passionate team from the IEEE Student Branch VIT Pune who designed, developed, and brought this platform to life.
          </p>
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {developers.map((dev) => (
            <div key={dev.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-md">
              <img
                src={dev.image}

                alt={dev.name}
                className="w-28 h-28 rounded-full mb-6 object-cover border-4 border-white shadow-inner bg-blue-600"
              />
              <h3 className="text-xl font-bold text-slate-900 mb-1">{dev.name}</h3>
              <p className="text-blue-600 font-medium mb-4">{dev.role}</p>

              <div className="flex space-x-4 mt-auto">
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Developers;