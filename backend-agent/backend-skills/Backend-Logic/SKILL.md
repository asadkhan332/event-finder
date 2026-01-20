# Backend & Security Skills

## 1. Security First
* **RLS Always**: Har naye table par 'Enable Row Level Security' lazmi hai.
* **Public Access**: Sirf 'Read' access public rakho, 'Write' hamesha authenticated users ke liye.

## 2. Authentication Logic
* **OAuth Flows**: Google login ke redirect URLs hamesha environment variables se fetch karo.
* **Profile Sync**: Naye user ke signup par automatic profile record create karne ka trigger handle karo.

## 3. Storage Management
* **Bucket Security**: 'event-images' bucket mein sirf wahi user delete kar sake jis ne upload kiya ho.
