# Deadlines Manager 📅

A beautiful, mobile-friendly web application to manage your deadlines and plan your day. Access it from any device!

## Features

- ✅ Add, edit, and delete deadlines
- 📅 Automatic sorting by due date
- 🎨 Color-coded status badges (Overdue, Today, Upcoming)
- 📱 Fully responsive mobile design
- 📝 Daily planning feature
- ☁️ Cloud database with MongoDB Atlas (free tier)
- 🔄 Real-time updates

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in with your Google account (you already have an account)
3. Create a new cluster (if you don't have one):
   - Choose the FREE tier (M0)
   - Select a cloud provider and region close to you
   - Click "Create Cluster"

4. Set up database access:
   - Click "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

5. Set up network access:
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. Get your connection string:
   - Click "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Replace `<username>` with your actual username

### 2. Local Development Setup

1. Install dependencies:
```bash
cd deadlines-app
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit the `.env` file and add your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/
PORT=3000
```

4. Start the development server:
```bash
npm start
```

5. Open your browser and go to: `http://localhost:3000`

## Deployment Options (FREE)

### Option 1: Render.com (Recommended)

1. Create account at [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (you'll need to push this code to GitHub first)
4. Configure:
   - **Name**: deadlines-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variable:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
6. Click "Create Web Service"
7. Your app will be live at: `https://your-app-name.onrender.com`

### Option 2: Railway.app

1. Create account at [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variable:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
5. Railway will auto-deploy
6. Your app will be live at the provided URL

### Option 3: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd deadlines-app
vercel
```

3. Follow the prompts and add your `MONGODB_URI` when asked for environment variables

## How to Push to GitHub (Required for Deployment)

1. Initialize git repository:
```bash
cd deadlines-app
git init
git add .
git commit -m "Initial commit: Deadlines manager app"
```

2. Create a new repository on GitHub:
   - Go to [GitHub.com](https://github.com)
   - Click "+" → "New repository"
   - Name it "deadlines-app"
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/deadlines-app.git
git branch -M main
git push -u origin main
```

## Usage

### Adding a Deadline
1. Click the "+ Add Deadline" button
2. Fill in the title (required)
3. Add a description (optional)
4. Set the due date (required)
5. Optionally set a due time
6. Click "Save Deadline"

### Editing a Deadline
1. Click the pencil icon (✏️) on any deadline
2. Modify the details
3. Click "Save Deadline"

### Deleting a Deadline
1. Click the trash icon (🗑️) on any deadline
2. Confirm the deletion

### Planning Tomorrow
1. Click the "Plan Tomorrow" tab
2. Write your plans in the text area
3. Click "Save Plan"

## Features Breakdown

- **Automatic Date Sorting**: Deadlines are always sorted from soonest to latest
- **Status Badges**:
  - 🔴 Red "Overdue" - Past the due date
  - 🟡 Yellow "Today" - Due today
  - 🔵 Blue "Upcoming" - Future deadlines
- **Responsive Design**: Works perfectly on phones, tablets, and desktops
- **Cloud Sync**: All data is stored in MongoDB Atlas and syncs across devices
- **Mobile-First**: Optimized for mobile usage with touch-friendly buttons

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Render/Railway/Vercel (all free)

## Troubleshooting

### Cannot connect to MongoDB
- Check that your IP address is whitelisted (use 0.0.0.0/0 for all IPs)
- Verify your connection string is correct
- Make sure you replaced `<password>` with your actual password

### App doesn't load after deployment
- Check the deployment logs for errors
- Verify environment variables are set correctly
- Ensure MongoDB Atlas allows connections from anywhere

### Deadlines not saving
- Open browser console (F12) to check for errors
- Verify the backend server is running
- Check MongoDB Atlas dashboard to see if data is being written

## Support

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the server logs
3. Verify all environment variables are set correctly

## License

Free to use and modify!
