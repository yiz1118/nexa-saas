export const creator = {
  name: "Alson Chua",
  title: "Independent Web & App Developer",
  email: "alsonchua18@gmail.com",
  portfolioUrl: "https://alson-portfolio-nine.vercel.app/",
  linkedinUrl: "https://www.linkedin.com/in/chua-yiz-063ba9272",
  githubUrl: "https://github.com/yiz1118",
  whatsappUrl: "https://wa.me/601158576386",
  whatsappDisplay: "+60 11-5857 6386",
  location: "Malaysia · Working with clients worldwide",
  availability: "Available for freelance projects worldwide",
  projectName: "NEXA",
} as const;

export const startProjectUrl = `${creator.whatsappUrl}?text=${encodeURIComponent(
  `Hi Alson, I came across your ${creator.projectName} concept project and I'm interested in discussing a website/app project with you.`,
)}`;
