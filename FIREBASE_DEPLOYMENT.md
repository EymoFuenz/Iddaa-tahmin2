# Firebase Deployment Guide

## Firestore Security Rules

The `firestore.rules` file contains security rules for your Firestore database. To deploy these rules:

### Using Firebase CLI

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Initialize Firebase** (if not done):
```bash
firebase init firestore
```

3. **Deploy the rules**:
```bash
firebase deploy --only firestore:rules
```

## Rules Summary

- **Teams Collection**: Public read, admin write
- **Matches Collection**: Public read, admin write
- **Predictions Collection**: Public read, admin write
- **Users Collection**: User-specific read/write, admin full access
- **User Predictions**: User-specific access, admin full access

## Authentication

- Users must be authenticated to create accounts
- Admins have full control over teams, matches, and predictions
- Regular users can create and view their own prediction history

## Deployment Checklist

- [ ] Install Firebase CLI
- [ ] Initialize Firebase project
- [ ] Update `.firebaserc` with your project ID
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Set up authentication methods in Firebase Console (Google, Email/Password, etc.)
- [ ] Configure admin users in Users collection (role: 'admin')
