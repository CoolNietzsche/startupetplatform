# StartupET Platform

<p align="center">
  <img src="https://place-hold.it/800x400?text=StartupET%20Platform&fontsize=32" alt="StartupET Platform" width="600">
</p>

## Ethiopian Startup Ecosystem Certification & Analytics Platform

StartupET is a comprehensive digital platform designed to transform Ethiopia's startup ecosystem through standardized certification, ecosystem mapping, and data-driven insights. The platform serves as the official digital infrastructure for the Ministry of Innovation and Technology's initiative to nurture, support, and promote Ethiopian startups and innovation hubs.

[![Next.js](https://img.shields.io/badge/built%20with-Next.js-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## 🌟 Features

### 1. Certification Portal
- **Multi-stage Application Wizard** with dynamic forms based on entity type
- **Document Management System** for secure uploads and verification
- **Review & Assessment Workflow** with scoring rubrics and consensus tools
- **Digital Certificate Issuance** with public verification portal
- **Renewal Management** for ongoing compliance tracking

### 2. Interactive Ecosystem Map
- **Regional Distribution** visualization of Ethiopia's startup landscape
- **Sector Analysis** with cross-sector collaboration insights
- **Growth Tracking** showing ecosystem evolution over time
- **Detailed Entity Profiles** for all ecosystem participants
- **Custom Map Creation** for specific analysis needs

### 3. Analytics Dashboard
- **Real-time Ecosystem Metrics** and KPIs
- **Funding Landscape** visualization and tracking
- **Talent & Skills** distribution and gap analysis
- **Policy Impact Assessment** tools
- **Custom Report Builder** for stakeholder presentations

### 4. Startup Resources & Support
- **Knowledge Library** with guides and templates
- **Funding Navigator** for opportunity matching
- **Mentor Connection Platform** for expertise sharing
- **Training & Skills Development** modules
- **Service Provider Marketplace** for ecosystem support

### 5. Administration Portal
- **User Management** with role-based access control
- **Application Processing** workflow management
- **Content Management** for resources and announcements
- **System Configuration** tools for customization
- **Comprehensive Reporting** capabilities

## 📋 Contents

- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🚀 Installation

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Git

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Yesunewh/Startup-Des.git
   cd Startup-Des
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💻 Usage

### User Types

The platform supports multiple user roles with different access levels:

1. **Ministry Officials** - Full administrative access
2. **Committee Members** - Application review and assessment capabilities
3. **Startups** - Application submission and certificate management
4. **Ecosystem Builders** - Service provider profiles and certification
5. **Public Users** - Access to public data and certificate verification

### Key Workflows

1. **Startup Certification Process**
   - Registration and profile creation
   - Application wizard completion
   - Document submission
   - Committee review and assessment
   - Certificate issuance and management

2. **Ecosystem Analysis**
   - Interactive map exploration
   - Data filtering and visualization
   - Report generation and export
   - Trend analysis and insights

3. **Administration**
   - User management and permissions
   - Application processing and review
   - System configuration and customization
   - Data management and reporting

## 📁 Project Structure

```
/
├── app/                # Next.js application pages
│   ├── admins-new/     # Admin portal pages
│   ├── auth/           # Authentication pages
│   ├── committee-portal/  # Committee review portal
│   ├── dashboard/      # Main dashboard pages
│   └── ecosystem/      # Ecosystem visualization pages
├── components/         # Reusable React components
│   ├── ui/             # Core UI components
│   ├── dashboard/      # Dashboard-specific components
│   └── ecosystem/      # Ecosystem visualization components
├── docs/               # Documentation files
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and services
│   ├── actions/        # Server actions
│   └── services/       # Service implementations
├── prisma/             # Database schema and migrations
├── public/             # Static assets
└── store/              # State management
```

## 🏗️ Architecture

StartupET is built on a modern web architecture:

- **Framework**: Next.js with App Router
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context and Hooks
- **Data Fetching**: Server Components and Actions
- **Database**: Prisma ORM (compatible with multiple databases)
- **Authentication**: Custom auth with secure sessions

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Platform Brief](/docs/startupet-platform-brief.md) - Overview of all platform features and capabilities
- [API Documentation](/docs/fayda-platform-api.md) - Integration points and API references
- [User Guides](/docs/README.md) - Detailed usage instructions

View the [full documentation](/docs) for more details.

## 🤝 Contributing

We welcome contributions to the StartupET platform! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Ministry of Innovation and Technology**  
Digital Transformation Office  
Email: startupet@mint.gov.et  
Phone: +251 111 111 111  
Website: www.startupet.gov.et

---

<p align="center">
  Developed for the Ethiopian startup ecosystem | © 2025 Ministry of Innovation and Technology
</p>
