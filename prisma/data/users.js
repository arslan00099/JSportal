const bcrypt = require("bcryptjs");

module.exports = [
  {
    email: "jobseeker@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "JOB_SEEKER",
    Profile: {
      create: {
        fullname: "Job Seeker",
        phnumber: 123123123,
        location: "New York, USA",
      },
    },
    Education: {
      create: [
        {
          degreName: "Bachelor of Science in Computer Science",
          universityName: "Tech University",
          description: "Studied software engineering and data science.",
          startFrom: "2015-09-01",
          endIn: "2019-06-01",
        },
      ],
    },
    Certificate: {
      create: [
        {
          certName: "Certified JavaScript Developer",
          orgName: "JavaScript Academy",
          description: "Certification in advanced JavaScript techniques.",
          startedOn: "2020-01-01",
          completedOn: "2020-06-01",
        },
      ],
    },
    EmpolymentHistory: {
      create: [
        {
          company: "Tech Corp",
          jobTitle: "Software Engineer",
          description: "Developed and maintained web applications.",
          startedOn: "2019-07-01",
          endOn: "2021-08-01",
        },
      ],
    },
    Location: {
      create: {
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: 10001,
      },
    },
  },
  {
    email: "mentor1@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "MENTOR",
    Profile: {
      create: {
        fullname: "Mentor One",
        phnumber: 123342213,
        location: "San Francisco, USA",
        about: "Experienced software developer and mentor.",
        companyName: "MentorWorks",
        tagline: "Helping developers grow.",
        industry: "Software Development",
        language: "English",
      },
    },
    Education: {
      create: [
        {
          degreName: "Master of Science in Computer Science",
          universityName: "Stanford University",
          description: "Advanced studies in software engineering.",
          startFrom: "2016-09-01",
          endIn: "2018-06-01",
        },
      ],
    },
    Certificate: {
      create: [
        {
          certName: "Certified Scrum Master",
          orgName: "Scrum Alliance",
          description: "Certification for agile project management.",
          startedOn: "2019-01-01",
          completedOn: "2019-04-01",
        },
      ],
    },
    EmpolymentHistory: {
      create: [
        {
          company: "Tech Corp",
          jobTitle: "Senior Developer",
          description: "Led a team of developers to build web applications.",
          startedOn: "2018-07-01",
          endOn: "2022-08-01",
        },
      ],
    },
    Location: {
      create: {
        city: "San Francisco",
        state: "CA",
        country: "USA",
        postalCode: 94105,
      },
    },
    services: {
      create: [
        {
          name: "One-on-One Mentoring",
          description: "Personalized mentoring sessions for developers.",
          pricing: 100, // price in cents
        },
        {
          name: "Code Review",
          description: "In-depth review of your code with feedback.",
          pricing: 50, // price in cents
        },
      ],
    },
  },
  {
    email: "mentor2@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "MENTOR",
    Profile: {
      create: {
        fullname: "Mentor Two",
        phnumber: 112312333,
        location: "Austin, USA",
        about: "Passionate about front-end development and design.",
        companyName: "DesignPro",
        tagline: "Designing the future.",
        industry: "UI/UX Design",
        language: "English, Spanish",
      },
    },
    Education: {
      create: [
        {
          degreName: "Bachelor of Arts in Design",
          universityName: "University of Texas",
          description: "Focused on UI/UX design principles.",
          startFrom: "2013-09-01",
          endIn: "2017-06-01",
        },
      ],
    },
    Certificate: {
      create: [
        {
          certName: "UX Design Certification",
          orgName: "Coursera",
          description: "Completed UX design courses.",
          startedOn: "2020-01-01",
          completedOn: "2020-06-01",
        },
      ],
    },
    EmpolymentHistory: {
      create: [
        {
          company: "Creative Solutions",
          jobTitle: "UI/UX Designer",
          description: "Designed user interfaces for mobile applications.",
          startedOn: "2017-07-01",
          endOn: "2021-08-01",
        },
      ],
    },
    Location: {
      create: {
        city: "Austin",
        state: "TX",
        country: "USA",
        postalCode: 73301,
      },
    },
    services: {
      create: [
        {
          name: "Design Consultation",
          description: "Consultation on UI/UX design for projects.",
          pricing: 75, // price in cents
        },
        {
          name: "Portfolio Review",
          description: "Feedback on your design portfolio.",
          pricing: 60, // price in cents
        },
      ],
    },
  },
  {
    email: "mentor3@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "MENTOR",
    Profile: {
      create: {
        fullname: "Mentor Three",
        phnumber: 13123132,
        location: "Seattle, USA",
        about: "Backend expert with a love for teaching.",
        companyName: "BackEnd Solutions",
        tagline: "Empowering developers.",
        industry: "Backend Development",
        language: "English",
      },
    },
    Education: {
      create: [
        {
          degreName: "Bachelor of Science in Information Technology",
          universityName: "University of Washington",
          description: "Specialized in backend development.",
          startFrom: "2014-09-01",
          endIn: "2018-06-01",
        },
      ],
    },
    Certificate: {
      create: [
        {
          certName: "AWS Certified Solutions Architect",
          orgName: "Amazon Web Services",
          description: "Certification for designing AWS solutions.",
          startedOn: "2021-01-01",
          completedOn: "2021-12-01",
        },
      ],
    },
    EmpolymentHistory: {
      create: [
        {
          company: "Cloud Services",
          jobTitle: "Backend Developer",
          description: "Developed APIs and backend services.",
          startedOn: "2018-07-01",
          endOn: "2022-08-01",
        },
      ],
    },
    Location: {
      create: {
        city: "Seattle",
        state: "WA",
        country: "USA",
        postalCode: 98101,
      },
    },
    services: {
      create: [
        {
          name: "Backend Development Mentorship",
          description: "Guidance on backend development best practices.",
          pricing: 120, // price in cents
        },
        {
          name: "System Architecture Review",
          description: "Assessment of your system architecture.",
          pricing: 90, // price in cents
        },
      ],
    },
  },
  {
    email: "recruiter@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "RECRUITER",
    Profile: {},
  },
];
