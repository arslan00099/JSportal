const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  let userData = [
    {
      email: "jobseeker11@example.com",
      password: bcrypt.hashSync("password123", 10),
      role: "JOB_SEEKER",
      Profile: {
        create: {
          fullname: "Alice Johnson",
          phnumber: 12312343,
          location: "San Francisco, USA",
        },
      },
      Education: {
        create: [
          {
            degreName: "Bachelor of Arts in Graphic Design",
            universityName: "Design University",
            description: "Focused on UI/UX design and visual arts.",
            startFrom: "2016-09-01",
            endIn: "2020-05-01",
          },
        ],
      },
      Certificate: {
        create: [
          {
            certName: "Adobe Certified Expert",
            orgName: "Adobe",
            description: "Certification in Adobe Creative Suite.",
            startedOn: "2021-02-01",
            completedOn: "2021-06-01",
          },
        ],
      },
      EmpolymentHistory: {
        create: [
          {
            company: "Creative Solutions",
            jobTitle: "Graphic Designer",
            description: "Designed branding and marketing materials.",
            startedOn: "2020-07-01",
            endOn: "2022-09-01",
          },
        ],
      },
      Location: {
        create: {
          city: "San Francisco",
          state: "CA",
          country: "USA",
          postalCode: 94103,
        },
      },
    },
    {
      email: "jobseeker2@example.com",
      password: bcrypt.hashSync("password123", 10),
      role: "JOB_SEEKER",
      Profile: {
        create: {
          fullname: "Michael Smith",
          phnumber: 14515135,
          location: "Austin, USA",
        },
      },
      Education: {
        create: [
          {
            degreName: "Bachelor of Engineering in Mechanical",
            universityName: "Austin State University",
            description: "Specialized in automotive engineering.",
            startFrom: "2014-08-01",
            endIn: "2018-05-01",
          },
        ],
      },
      Certificate: {
        create: [
          {
            certName: "Certified CAD Designer",
            orgName: "CAD Academy",
            description: "Advanced CAD modeling techniques.",
            startedOn: "2019-01-01",
            completedOn: "2019-03-01",
          },
        ],
      },
      EmpolymentHistory: {
        create: [
          {
            company: "Auto Solutions",
            jobTitle: "Mechanical Engineer",
            description: "Developed components for electric vehicles.",
            startedOn: "2018-07-01",
            endOn: "2021-10-01",
          },
        ],
      },
      Location: {
        create: {
          city: "Austin",
          state: "TX",
          country: "USA",
          postalCode: 78701,
        },
      },
    },
    {
      email: "jobseeker3@example.com",
      password: bcrypt.hashSync("password123", 10),
      role: "JOB_SEEKER",
      Profile: {
        create: {
          fullname: "Linda Brown",
          phnumber: 12341514,
          location: "Chicago, USA",
        },
      },
      Education: {
        create: [
          {
            degreName: "Master of Science in Data Science",
            universityName: "Illinois Tech",
            description: "Focused on machine learning and AI.",
            startFrom: "2018-09-01",
            endIn: "2020-06-01",
          },
        ],
      },
      Certificate: {
        create: [
          {
            certName: "AWS Certified Data Engineer",
            orgName: "Amazon",
            description: "Certification in AWS data engineering.",
            startedOn: "2021-04-01",
            completedOn: "2021-08-01",
          },
        ],
      },
      EmpolymentHistory: {
        create: [
          {
            company: "Data Insight",
            jobTitle: "Data Scientist",
            description: "Worked on predictive analytics projects.",
            startedOn: "2020-07-01",
            endOn: "Present",
          },
        ],
      },
      Location: {
        create: {
          city: "Chicago",
          state: "IL",
          country: "USA",
          postalCode: 60616,
        },
      },
    },
    {
      email: "jobseeker4@example.com",
      password: bcrypt.hashSync("password123", 10),
      role: "JOB_SEEKER",
      Profile: {
        create: {
          fullname: "Robert Lee",
          phnumber: 13413446,
          location: "Seattle, USA",
        },
      },
      Education: {
        create: [
          {
            degreName: "Master of Arts in Marketing",
            universityName: "Seattle University",
            description: "Specialized in digital marketing strategies.",
            startFrom: "2017-09-01",
            endIn: "2019-06-01",
          },
        ],
      },
      Certificate: {
        create: [
          {
            certName: "Google Analytics Expert",
            orgName: "Google",
            description: "Advanced analytics and SEO techniques.",
            startedOn: "2019-10-01",
            completedOn: "2020-02-01",
          },
        ],
      },
      EmpolymentHistory: {
        create: [
          {
            company: "Market Solutions",
            jobTitle: "Marketing Specialist",
            description: "Managed SEO and digital ad campaigns.",
            startedOn: "2019-07-01",
            endOn: "2022-04-01",
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
    },
    {
      email: "jobseeker5@example.com",
      password: bcrypt.hashSync("password123", 10),
      role: "JOB_SEEKER",
      Profile: {
        create: {
          fullname: "Sophia Martinez",
          phnumber: 13413413,
          location: "Los Angeles, USA",
        },
      },
      Education: {
        create: [
          {
            degreName: "Bachelor of Business Administration",
            universityName: "University of California",
            description: "Focused on finance and management.",
            startFrom: "2015-09-01",
            endIn: "2019-05-01",
          },
        ],
      },
      Certificate: {
        create: [
          {
            certName: "Financial Analyst Certificate",
            orgName: "Finance Academy",
            description: "Training in financial modeling and analysis.",
            startedOn: "2020-03-01",
            completedOn: "2020-08-01",
          },
        ],
      },
      EmpolymentHistory: {
        create: [
          {
            company: "Finance Corp",
            jobTitle: "Financial Analyst",
            description: "Conducted financial research and analysis.",
            startedOn: "2019-06-01",
            endOn: "Present",
          },
        ],
      },
      Location: {
        create: {
          city: "Los Angeles",
          state: "CA",
          country: "USA",
          postalCode: 90001,
        },
      },
    },
  ];

  for (const user of userData) {
    const userCreate = await prisma.user.create({
      data: user,
    });
    console.log(userCreate);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
