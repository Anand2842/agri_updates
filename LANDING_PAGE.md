# Landing Page Logic & Sections

This document explains how content is selected and displayed on the Agri Updates landing page.

## Core Principle: "Display Location" Override
The system prioritizes your explicit choices first. If you set a post's **Display Location** in the Admin Panel, it guarantees placement in that specific section.

**Hierarchy of Importance:**
1. **Explicit Location** (e.g., You selected "Hero" or "Trending" in Admin)
2. **Featured Flag** (You checked "Featured Listing")
3. **Date (Newest First)** (Default fallback)

---

## 1. Main Hero (The Big Banner)
*   **Location**: Top center, large image.
*   **Logic**:
    1.  Checks for a post with **Display Location = "Main Hero"**.
    2.  *Fallback*: Uses the most recent "Featured" post.
    3.  *Fallback*: Uses the absolute newest published post.

## 2. Featured Grid (Top Row - 3 Cards)
*   **Location**: Top row immediately below the Hero or header.
*   **Logic**:
    1.  Fills with posts set to **Display Location = "Featured Grid"**.
    2.  *Fallback*: Fills remaining spots with any post marked **"Featured Listing"** (checked box).

## 3. Trending (Numbered List - Left Column)
*   **Location**: Left sidebar, numbered 1-5.
*   **Logic**:
    1.  Fills with posts set to **Display Location = "Trending"**.
    2.  *Fallback*: Fills remaining spots with the **newest available posts** that aren't already shown in Hero or Featured.

## 4. Don't Miss (Bottom Grid - 4 Cards)
*   **Location**: Bottom of the page.
*   **Logic**:
    1.  Fills with posts set to **Display Location = "Don't Miss"**.
    2.  *Fallback*: Fills remaining spots with the next available posts from the feed.

## 5. Opportunities (Right Sidebar)
*   **Location**: Right sidebar.
*   **Logic**:
    *   **Strict Rule**: Only shows posts with **Category = "Jobs"**.
    *   **Order**: Newest to Oldest.
    *   *Note*: Jobs CAN also appear in Hero/Trending now if they are the newest items, but this specific sidebar is exclusively for Jobs.

---

## Example Scenarios

### "I want a new Job to be at the very top."
*   **Automatic Way**: Just publish it. If it's the newest post, it will likely take the Hero spot (if no explicit Hero is set) or be #1 in the recent list.
*   **Guaranteed Way**: In Admin, set Display Location to **"Main Hero"**.

### "I want an important update to stay in Trending #1."
*   In Admin, set Display Location to **"Trending"**. It will jump to the top of the Trending list.
