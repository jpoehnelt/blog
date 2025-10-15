const { hi } = require("date-fns/locale");

/**
 * @enum {string}
 */
const Focus = {
  GENERIC: "generic",
  BACKEND: "backend",
  DEVREL: "devrel",
  DISTRIBUTED: "distributed",
  FULLSTACK: "fullstack",
  OPS: "ops",
  FRONTEND: "frontend",
};

/**
 * @typedef {Object} Highlight
 * @type {Focus} types
 * @prop {string} text
 * @prop {number} score
 *
 * @typedef {Object} Highlights
 * @prop {Focus.GENERIC} string[]
 * @prop {Focus.BACKEND} string[]
 * @prop {Focus.DEVREL} string[]
 * @prop {Focus.DISTRIBUTED} string[]
 * @prop {Focus.FULLSTACK} string[]
 * @prop {Focus.OPS} string[]
 * @prop {Focus.FRONTEND} string[]
 *
 * @typedef {Object} Experience
 * @prop {string} title
 * @prop {string} company
 * @prop {string} companyLink
 * @prop {string} icon https://icones.js.org/collection/logos
 * @prop {string} startDate
 * @prop {string} endDate
 * @prop {string} location
 * @prop {Highlights} highlights
 *
 * @typedef {Object} CategorizedSkills
 * @prop {string} category
 * @prop {string[]} skills
 *
 * @typedef {Object} Project
 * @prop {string} title
 * @prop {string} description
 * @prop {string} link
 * @prop {string} source
 */

/**
 * Return an object keyed by the different types of highlights. Maintain a
 * minimum number of highlights per type.
 * @param {Highlight[]} highlights
 * @returns {Highlights}
 */
function toHighlights(highlights) {
  // Note: JavaScript Set maintains insertion order
  const obj = {
    [Focus.GENERIC]: new Set(),
    [Focus.BACKEND]: new Set(),
    [Focus.DEVREL]: new Set(),
    [Focus.DISTRIBUTED]: new Set(),
    [Focus.FRONTEND]: new Set(),
    [Focus.FULLSTACK]: new Set(),
    [Focus.OPS]: new Set(),
  };

  highlights = [...highlights].sort((a, b) => b.score - a.score);

  for (const highlight of highlights) {
    for (const type of highlight.types) {
      if (!obj[type]) {
        obj[type] = new Set();
      }

      obj[type].add(highlight.text);
    }
  }

  // add highlights for other types
  for (const key of Object.keys(obj)) {
    for (const highlight of highlights) {
      obj[key].add(highlight.text);
    }

    obj[key] = Array.from(obj[key]);
  }

  return obj;
}

/**
 * @type {Experience[]}
 */
const experiences = [
  {
    company: "Google",
    companyLink: "https://google.com",
    endDate: "Present",
    highlights: toHighlights([
      {
        text: "Created an interactive Angular web app that allows users to explore and debug Google Workspace APIs, resulting in an enhanced developer experience.",
        types: [Focus.DEVREL, Focus.FULLSTACK, Focus.FRONTEND],
        score: 1,
      },
      {
        text: "Crafted impactful demos and blog content for high-profile product launches, contributing to successful product adoption and customer engagement.",
        types: [Focus.DEVREL],
        score: 0.7,
      },
      {
        text: "Presented and engaged with customers at conferences like Google I/O, Google Next, and Workspace Developer Summits, showcasing technical prowess and building strong relationships.",
        types: [Focus.DEVREL],
        score: 1,
      },
      {
        text: "Established industry-best practices for Google Maps JavaScript samples, leveraging TypeScript, modern JavaScript, and popular ecosystem tools, resulting in improved code quality and developer productivity.",
        types: [Focus.DEVREL, Focus.FRONTEND, Focus.FULLSTACK, Focus.OPS],
        score: 0.5,
      },
      {
        text: "Enhanced the Google Maps JavaScript API by adding Promise support while seamlessly maintaining the existing callback pattern, simplifying asynchronous programming for developers.",
        types: [Focus.DEVREL, Focus.FRONTEND],
        score: 0.9,
      },
      {
        text: "Published impactful NPM libraries like [@googlemaps/js-api-loader](https://www.npmjs.com/package/@googlemaps/js-api-loader) to seamlessly integrate Google Maps JavaScript API with modern frameworks, enabling developers to easily incorporate maps into their applications.",
        types: [Focus.DEVREL, Focus.FRONTEND, Focus.FULLSTACK, Focus.OPS],
        score: 1,
      },
      {
        text: "Generated OpenAPI specs for Google Maps APIs, exported them to Postman collections, and created interactive documentation using Bazel and markdown, improving API discoverability and developer onboarding.",
        types: [
          Focus.DEVREL,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.OPS,
        ],
        score: 1,
      },
      {
        text: "Automated TypeScript typings generation for Google Maps APIs, ensuring accurate and up-to-date typings for developers. Contributed to the DefinitelyTyped repository and [@types/google.maps](https://www.npmjs.com/package/@types/google.maps), improving the developer experience.",
        types: [Focus.DEVREL, Focus.FRONTEND, Focus.FULLSTACK, Focus.OPS],
        score: 1,
      },
      {
        text: "Improved developer experience by creating an [ESLint plugin for Google Maps JavaScript](https://github.com/googlemaps/eslint-plugin-googlemaps).",
        types: [Focus.DEVREL, Focus.FRONTEND, Focus.FULLSTACK, Focus.OPS],
        score: 0.7,
      },
      {
        text: "Streamlined testing and releases for [github.com/googlemaps](https://github.com/googlemaps) by implementing policies for an engaged developer community. Published key NPM packages and GitHub Apps, including [semantic-release-replace-plugin](https://www.npmjs.com/package/@google/semantic-release-replace-plugin), [secrets-sync-action](https://github.com/google/secrets-sync-action), [semantic-release-interval](https://github.com/jpoehnelt/semantic-release-interval), [semantic-release-npm-deprecate](https://github.com/jpoehnelt/semantic-release-npm-deprecate), and an [inclusive language GitHub bot](https://github.com/jpoehnelt/in-solidarity-bot).",
        types: [Focus.DEVREL, Focus.OPS, Focus.FRONTEND],
        score: 0.6,
      },
      {
        text: "Implemented feedback processing pipelines with Google Cloud Platform, LLMs, vector embeddings, TF-IDF, and machine learning models, resulting in improved team and organization efficiency. Developed a Chrome extension to enhance productivity.",
        types: [
          Focus.DEVREL,
          Focus.OPS,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.BACKEND,
          Focus.DISTRIBUTED,
        ],
        score: 1,
      },
      {
        text: "Generated, maintained, and published gRPC client libraries using Bazel and cutting-edge open source tools, enabling seamless integration with other systems.",
        types: [
          Focus.DEVREL,
          Focus.OPS,
          Focus.FULLSTACK,
          Focus.BACKEND,
          Focus.DISTRIBUTED,
        ],
        score: 0.6,
      },
    ]),
    icon: "i-logos-google",
    location: "Remote",
    startDate: "August 2019",
    title: "Senior Developer Relations Engineer",
  },
  {
    company: "Descartes Labs",
    companyLink: "https://descarteslabs.com",
    endDate: "August 2019",
    highlights: toHighlights([
      {
        types: [
          Focus.BACKEND,
          Focus.DEVREL,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
        ],
        text: "Achieved significant improvements in satellite imagery analysis by designing and implementing a sophisticated abstraction layer, integrating GDAL, NumPy, SciPy, Tensorflow, and Apache Arrow with cloud computing primitives. Published a Python package and extended the DSL and operations graph to enable interactive exploration.",
        score: 1,
      },
      {
        types: [
          Focus.BACKEND,
          Focus.DEVREL,
          Focus.DISTRIBUTED,
          Focus.FULLSTACK,
          Focus.OPS,
        ],
        text: "Led a team in developing a robust distributed system for processing petabytes of satellite imagery, utilizing Python, Golang, Docker, Kubernetes, and Google Cloud Platform. Resulted in significant performance improvements and increased scalability.",
        score: 1,
      },
      {
        types: [
          Focus.BACKEND,
          Focus.DEVREL,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.OPS,
        ],
        text: "Successfully migrated the company codebase to a monorepo using Bazel, implementing a state-of-the-art distributed build and deployment system with tools such as Spinnaker, Drone, Helm, Jsonnet, and Kubernetes. Streamlined development processes and improved collaboration across teams.",
        score: 0.9,
      },
      {
        types: [
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.OPS,
        ],
        text: "Implemented an OpenResty API gateway and eventually migrated to Envoy proxy, establishing a streamlined service mesh with Istio. Improved service reliability and performance.",
        score: 0.7,
      },
      {
        types: [
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
        ],
        text: "Designed and implemented an advanced GeoSpatial Vector service on BigQuery using Go and gRPC. Enabled efficient and scalable geospatial data processing.",
        score: 0.6,
      },
      {
        types: [
          Focus.DEVREL,
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.OPS,
        ],
        text: "Implemented rigorous software engineering protocols, including thorough code reviews, comprehensive testing, and documentation. Led impactful cross-functional team guild dialogues to foster a culture of knowledge sharing and collaboration. Resulted in improved code quality and increased productivity.",
        score: 0.5,
      },
      {
        types: [
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.OPS,
        ],
        text: "Engineered an approximate nearest neighbor search using locality-sensitive hashing and vector embeddings, seamlessly deployed to production with Kubernetes, Google Cloud Platform, Redis, and Google Cloud Storage for multi-layered caching. Improved search performance and reduced latency.",
        score: 0.8,
      },
    ]),
    icon: "i-custom-descartes scale-[2.5]",
    location: "Santa Fe, NM",
    startDate: "July 2016",
    title: "Senior Software Engineer",
  },
  {
    company: "USGS",
    companyLink: "https://usgs.gov",
    endDate: "July 2016",
    highlights: toHighlights([
      {
        text: "Developed a Python Flask API on Postgresql with OpenID for authorization, resulting in improved security and user authentication.",
        types: [Focus.BACKEND, Focus.FRONTEND, Focus.FULLSTACK],
        score: 1,
      },
      {
        text: "Managed asynchronous tasks with Celery and Redis on AWS EC2 instances, optimizing performance and scalability of distributed systems.",
        types: [Focus.DISTRIBUTED, Focus.BACKEND, Focus.FULLSTACK],
        score: 1,
      },
      {
        text: "Built a crowd-sourcing web app with Angular, utilizing D3, Leaflet, and custom SVG Angular components for data visualization, enhancing user experience and engagement.",
        types: [Focus.FULLSTACK, Focus.FRONTEND],
        score: 1,
      },
      {
        text: "Implemented algorithms in Google Earth Engine for real-time spatial analysis, integrating with GDAL, OGC standards, and ArcGIS/ENVI, enabling efficient and accurate geospatial data processing.",
        types: [Focus.BACKEND, Focus.FULLSTACK, Focus.FRONTEND],
        score: 0.4,
      },
      {
        text: "Designed, implemented, and published a mobile app for ground data collection in sub-Saharan Africa, facilitating data collection and analysis for research purposes.",
        types: [Focus.FULLSTACK, Focus.FRONTEND],
        score: 0.5,
      },
      {
        text: "Established version control practices, migrating algorithms to Git, and versioned model inputs in cloud storage, ensuring proper tracking and management of code and data.",
        types: [Focus.OPS],
        score: 0.3,
      },
    ]),
    icon: "i-custom-usgs",
    location: "Flagstaff, AZ",
    startDate: "April 2014",
    title: "Computer Scientist",
  },
  {
    company: "IBM",
    companyLink:
      "https://www.ibm.com/blogs/jobs/extreme-blue-ibms-leadership-program-for-future-tech-business-leaders/",
    endDate: "August 2015",
    highlights: toHighlights([
      {
        types: [
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.OPS,
        ],
        text: "Led the optimization of Walmart's IT incident data in a high-performance OLAP system, resulting in improved data processing and analysis capabilities. Developed a cutting-edge web application for data visualization using Angular and D3, providing actionable insights for outage prediction through the application of advanced machine learning and statistical analysis techniques.",
        score: 1,
      },
      {
        types: [
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.OPS,
        ],
        text: "Designed and developed a mobile app for seamless user interaction with incident data and instant real-time outage notifications.",
        score: 0.6,
      },
      {
        types: [
          Focus.BACKEND,
          Focus.DISTRIBUTED,
          Focus.FRONTEND,
          Focus.FULLSTACK,
          Focus.OPS,
          Focus.DEVREL,
        ],
        text: "Collaborated with a highly skilled and innovative team of interns in IBM's prestigious Extreme Blue Technical Leader Program, driving impactful contributions to cutting-edge projects.",
        score: 0,
      },
    ]),
    icon: "i-logos-ibm",
    location: "Austin, TX",
    startDate: "May 2015",
    title: "Software Engineer Intern",
  },
];

const publications = [
  "Keisler, R., Skillman, S. W., Gonnabathula, S., Poehnelt, J., Rudelis, X., & Warren, M. S. (2019). Visual search over billions of aerial and satellite images. Computer Vision and Image Understanding, 187, 102790.",
  "Moody, D. I., Brumby, S. P., Chartrand, R., Keisler, R., Mathis, M., Beneke, C. M., ... & Poehnelt, J. (2018, June). Satellite imagery analysis for automated global food security forecasting. In Algorithms and Technologies for Multispectral, Hyperspectral, and Ultraspectral Imagery XXIV (Vol. 10644, p. 1064429). International Society for Optics and Photonics.",
  "Xiong, J., Thenkabail, P. S., Gumma, M. K., Teluguntla, P., Poehnelt, J., Congalton, R. G., ... & Thau, D. (2017). Automated cropland mapping of continental Africa using Google Earth Engine cloud computing. ISPRS Journal of Photogrammetry and Remote Sensing, 126, 225-244.",
  "Teluguntla, P., Thenkabail, P. S., Xiong, J., Gumma, M. K., Congalton, R. G., Oliphant, A., Poehnelt, J., ... & Massey, R. (2017). Spectral matching techniques (SMTs) and automated cropland classification algorithms (ACCAs) for mapping croplands of Australia using MODIS 250-m time-series (2000–2015) data. International Journal of Digital Earth, 10(9), 944-977.",
];

/**
 * @type {CategorizedSkills[]}
 */
const skills = [
  {
    category: "Languages",
    skills: [
      "CSS",
      "Go",
      "HTML",
      "JavaScript",
      "Lua",
      "Python",
      "Proto",
      "Rust",
      "SQL",
      "TypeScript",
    ],
  },
  {
    category: "Frameworks & Libraries",
    skills: [
      "Angular",
      "Apache Arrow",
      "Axum",
      "Celery",
      "D3",
      "Dask",
      "Django",
      "Express",
      "FastAPI",
      "Flask",
      "Google Maps",
      "Helm",
      "Leaflet",
      "Lit",
      "MapLibre",
      "MUI",
      "Next.js",
      "Numpy",
      "OpenResty",
      "React",
      "RxJS",
      "SciPy",
      "Sveltekit",
      "TailwindCSS",
    ],
  },
  {
    category: "Testing & Libraries",
    skills: [
      "AJV",
      "Black",
      "ESlint",
      "Faker",
      "Flake8",
      "Jasmine",
      "Jest",
      "Karma",
      "Lighthouse",
      "Nox",
      "Playwright",
      "Postman",
      "Prettier",
      "Pytest",
      "Testify",
      "Vitest",
      "Zod",
    ],
  },
  {
    category: "Tools, Services, & Databases",
    skills: [
      "AWS",
      "Bazel",
      "BigQuery",
      "Cloudflare",
      "DigitalOcean",
      "Docker",
      "DroneIO",
      "ElasticSearch",
      "Envoy",
      "GCP",
      "Github Actions",
      "InfluxDB",
      "Istio",
      "Kubernetes",
      "Netlify",
      "Nginx",
      "OpenTelemetry",
      "OpenAI",
      "Postgresql",
      "Proxmox",
      "Redis",
      "Sentry",
      "Spinnaker",
      "Terraform",
      "Vercel",
      "VertexAI",
      "Vultr",
    ],
  },
];

const versions = Object.values(Focus);

const education = [
  {
    degree: "B.S. Computer Science",
    icon: "i-custom-nau",
    university: "University of Northern Arizona",
  },
  {
    degree: "B.S. Finance, Economics",
    icon: "i-custom-uwlax",
    university: "University of Wisconsin La Crosse",
  },
];

const summary =
  "Proven track record in architecting and implementing sophisticated solutions, showcasing expertise in leading high-impact projects, fostering collaborative development practices, and consistently delivering innovative results.";

const role = "<software-engineer/>";

module.exports = {
  experiences,
  publications,
  skills,
  versions,
  summary,
  education,
  role,
};
