# Quick Start Testing Guide

## What Was Fixed

**Phase 3 Changes (Latest):**
1. ✅ Fixed endpoint permissions - reviews/ratings now public (GET /api/providers/**)
2. ✅ Secured review submission - requires authentication, no user ID spoofing
3. ✅ Added auth check to "check my review" endpoint
4. ✅ Improved error messages - differentiates auth errors from other failures

**Total Project Status:**
- ✅ Authentication system working (Phase 1)
- ✅ Provider details visible when logged out (Phase 2)
- ✅ Scroll restoration on navigation (Phase 2)
- ✅ Chatbot verified working (Phase 2)
- ✅ Security hardened (Phase 3)

---

## How to Test (Step-by-Step)

### Setup: Start Both Services

**Terminal 1 - Backend:**
```bash
cd "c:\Users\deepa\Desktop\spring board2 - Copy\backend"
mvn spring-boot:run
# Wait for: "Started ServiceApplication in X seconds"
```

**Terminal 2 - Frontend:**
```bash
cd "c:\Users\deepa\Desktop\spring board2 - Copy\front-end"
npm run dev
# Wait for: "Local: http://localhost:5173/"
```

**Browser:**
```
Open http://localhost:5173
```

---

## Test 1: Logged Out - Browse Provider (CRITICAL FIX)

**What to Test:** Provider details and reviews should load when logged out

**Steps:**
1. Make sure you're logged out (no user in top-right corner)
2. Click "Browse Services" or go to Services page
3. Click any provider name
4. **✅ Expected:** Provider name, description, and services visible
5. **✅ Expected:** Reviews section shows existing reviews
6. **✅ Expected:** Average rating shows (e.g., "4.5 stars from 3 reviews")
7. **✅ Expected:** "Please login to write a review" message (not error)
8. Refresh the page - all should still load

**If You See Errors:**
- ❌ "Provider not found" → Endpoint permission issue (should be fixed)
- ❌ "Failed to load reviews" → Different cause, check console
- ❌ Blank page → Auth check blocking when it shouldn't

**Console Check:**
- Right-click → Inspect → Console tab
- Should see NO 401/403 errors for review/rating endpoints
- Should see 200 OK responses

---

## Test 2: Logged In - Write a Review

**What to Test:** Can submit review as authenticated user

**Steps:**
1. **Register/Login** if not already logged in
2. Go to any provider page (someone else, not yourself)
3. Scroll to reviews section
4. Click "Write a Review"
5. Select rating: 1-5 stars
6. Add comment: "This is a test review"
7. Click Submit
8. **✅ Expected:** Review appears immediately in the list
9. **✅ Expected:** See "You already reviewed this provider" message
10. Refresh page - review should still be there

**If You See Errors:**
- ❌ 401 Unauthorized → Need to be logged in (login first)
- ❌ "You have already reviewed" → Normal, means it's working
- ❌ Error in console → Check what status code

---

## Test 3: Logout & Refresh

**What to Test:** Logging out doesn't break viewing other providers' details

**Steps:**
1. Be on any provider's detail page
2. Click "Logout" in top-right
3. **✅ Expected:** Provider details STILL visible (don't go away)
4. **✅ Expected:** Reviews STILL visible
5. **✅ Expected:** No "Provider not found" error
6. Refresh the page
7. **✅ Expected:** Everything still loads correctly
8. You should see "Please login to review" (not "failed to load reviews")

**This Tests:** Public access is working correctly

---

## Test 4: Scroll Restoration

**What to Test:** Each page opens at top, not at previous scroll position

**Steps:**
1. Go to Services page
2. Scroll down to middle/bottom
3. Click on any provider to view details
4. **✅ Expected:** Provider page opens AT TOP (not scrolled down)
5. Scroll down on provider page
6. Click "Services" in header to go back
7. **✅ Expected:** Services page opens at TOP (not scrolled down to where you were)

**This Tests:** ScrollToTop component is working

---

## Test 5: Role-Based Access

**What to Test:** Each role sees only their own dashboard

### As USER:
1. Register as regular user or login with USER account
2. Should see "User Dashboard" link
3. Click it - goes to `/user/dashboard`
4. Should see user-specific content
5. Try to access `/provider/dashboard` directly in URL - should redirect
6. Try to access `/admin/dashboard` directly in URL - should redirect

### As PROVIDER:
1. Login as provider account
2. Should see "Provider Dashboard" link
3. Click it - goes to `/provider/dashboard`
4. Should see provider-specific content
5. Try to access `/user/dashboard` or `/admin/dashboard` - should redirect

### As ADMIN:
1. Login as admin account
2. Should see "Admin Dashboard" link
3. Click it - goes to `/admin/dashboard`
4. Should see admin-specific content (users, bookings, approvals)

**✅ Expected:** Each role is restricted to their own dashboard

---

## Test 6: Chatbot

**What to Test:** Chatbot works when logged in and logged out

**Steps:**
1. Look for chatbot icon (bottom-right corner, purple button)
2. Click it to open chat window
3. **Logged Out Test:**
   - Type: "What services do you provide?"
   - Should get response (doesn't require login)
4. Login as any user
5. **Logged In Test:**
   - Type: "Tell me about your services"
   - Should still get response

**✅ Expected:** Works both logged in and out

---

## Detailed Error Messages Guide

### If You See Error When Browsing Provider Details:

**Error: "Provider not found"**
- Cause: User endpoint not accessible
- Fix: Verify GET /api/users/{id} is permitted in SecurityConfig
- Check: Console should show 404, not 401/403

**Error: "Failed to load reviews"**
- Cause: Review endpoint permission issue
- Check Console: What HTTP status code? (401/403/500)
- Fix Phase 3: GET /api/providers/{id}/reviews should be permitted

**Error in Console: 401 Unauthorized on /api/providers/{id}/reviews**
- Cause: GET /api/providers/** not in permitAll()
- Solution: Add to SecurityConfig: `.requestMatchers(HttpMethod.GET, "/api/providers/**").permitAll()`

**Error in Console: 403 Forbidden**
- Cause: Endpoint matched but SecurityFilterChain denied
- Check: Review SecurityConfig order - permitAll() should be before anyRequest().authenticated()

---

## Review the Changes (For Developers)

### What Changed in Phase 3

**1. SecurityConfig.java (~line 30):**
```
BEFORE: .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
AFTER:  .requestMatchers(HttpMethod.GET, "/api/providers/**").permitAll()
```

**2. ReviewController.java - addReview() method:**
```
BEFORE: Long reviewerId = resolveCurrentUserId(userIdFromPayload);
AFTER:  Extract user from SecurityContext ONLY, no payload userId accepted
```

**3. ReviewController.java - getMyReview() method:**
```
BEFORE: if (reviewerId == null) { return ok(...); }
AFTER:  if (not authenticated) { return 401(...); }
```

**4. ProviderPublic.jsx - loadReviewData():**
```
BEFORE: catch { setError('Failed to load reviews...') }
AFTER:  if (401/403) { setError('Please refresh...') } else { setError('Failed...') }
```

---

## Security Verification

### Test User ID Spoofing Prevention

**This tests that you CANNOT create a review as someone else:**

1. Open Developer Tools (F12)
2. Go to Console tab
3. Paste this code to submit a manual request:

```javascript
fetch('http://localhost:8089/api/providers/1/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 999,  // Try to spoof a different user
    rating: 5,
    comment: 'Hacked review'
  })
})
.then(r => r.json())
.then(d => console.log('Status:', r.status, 'Body:', d))
```

**✅ Expected:** Response is 401 Unauthorized with message "Authentication required to submit a review"

**❌ If You See:** 200 OK with review created → Security issue, report it

---

## Build Verification

To verify all code compiles:

```bash
# Backend
cd backend
mvn clean compile -q
echo $?  # Should print: 0

# Frontend
cd front-end
npm run build
# Should see: "built in X.XXs" at end
```

---

## Common Test Checklist

Before signing off, verify:

- [ ] Can browse providers when logged out
- [ ] Can see reviews when logged out
- [ ] Can submit review when logged in
- [ ] Cannot see "write review" form when logged out
- [ ] Logout doesn't break provider details
- [ ] Each page opens at top on navigation
- [ ] Each role sees only their dashboard
- [ ] Chatbot works logged in and out
- [ ] Cannot spoof user ID in review
- [ ] Proper error messages shown
- [ ] No 401/403 errors in console for public endpoints
- [ ] No 200 errors for private endpoints when logged out

---

## Quick Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Provider not found" when logged out | GET /api/users not permitted | Add permitAll() for GET /api/users/** |
| "Failed to load reviews" when logged out | GET /api/providers not permitted | Add permitAll() for GET /api/providers/** |
| Cannot write review when logged in | JWT not in localStorage | Login again, check localStorage |
| Review created as wrong user | User ID spoofing | Should be fixed, check ReviewController uses SecurityContext |
| Page scrolls to previous position | ScrollToTop not working | Check App.jsx has scroll effect with setTimeout |
| Wrong dashboard shown | Auth not initialized | Check AuthContext isLoading and ProtectedRoute loading state |
| Chatbot not responding | API key or network issue | Check console for error details |

---

## Next Steps After Testing

1. **If all tests pass:** ✅ Proceed to production deployment
2. **If errors found:** 
   - Note the exact error and steps to reproduce
   - Check console for error details
   - Review the "Error Messages Guide" section above
   - Check file paths and verify changes were applied

3. **For production deployment:**
   - Build backend: `mvn clean package`
   - Build frontend: `npm run build`
   - Deploy dist/ folder and backend JAR
   - Update database if needed
   - Monitor logs for errors

---

**Document Version:** 1.0  
**Last Updated:** Phase 3 Complete  
**Status:** Ready for Testing ✅
