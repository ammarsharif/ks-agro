# KS Agro Chemicals & Fertilizers - Invoice Management System

A sleek, responsive, client-side web application built with React and Vite for generating and managing invoices. Tailored specifically for KS Agro Chemicals & Fertilizers, this tool ensures accurate local data persistence, custom A4-scaled PDF generation, and a professional user interface.

## 🚀 Features

- **Instant Invoice Generation**: Dynamically add, remove, and manage invoice line items.
- **Product Management (CRUD)**: Manage your inventory directly within the app. Products are saved to your browser so you don't have to re-enter them.
- **Local Persistence**: Draft invoices and product catalogs are seamlessly saved to `localStorage`. You won't lose your work if you accidentally refresh the page.
- **Randomized Bill Numbers**: Automatically generates professional 4-digit randomized bill numbers for every new invoice.
- **High-Quality PDF Exports**: Integrated with `jsPDF` and `html2canvas` to instantly convert the A4-scaled invoice into a downloadable PDF document.
- **Mobile-Responsive**: Features an independent "Preview" mode so you can view and screenshot your invoice flawlessly from a mobile device.
- **No Backend Required**: 100% frontend. Secure, lightweight, and deployable entirely on edge networks or static hosting.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **PDF Generation**: `jspdf` & `html2canvas`
- **Fonts**: Google Fonts (Inter)

## 📦 Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Development Server**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`*

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 🌐 Deployment (Vercel)

This project includes a `vercel.json` configuration file, making it ready for instant deployment on Vercel.

**Option 1: Vercel CLI**
```bash
npm i -g vercel
vercel
```

**Option 2: GitHub Integration**
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com/new).
3. Import the repository. Vercel will automatically detect the Vite framework and handle the build.

## 📄 License

This project is proprietary software developed for internal use by KS Agro Chemicals.
