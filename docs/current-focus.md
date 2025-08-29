# Current Focus: Dashboard UI Contrast Fix

**Updated:** 2025-01-29  
**Priority:** HIGH

## Current Issue: Poor Contrast in Dashboard Cards

**Problem**: Card content areas in the dashboard have poor contrast due to hardcoded light theme colors that don't adapt to the dark theme system.

**Affected Areas**:
- Transaction history cards (Mining History tab)
- Event display cards (Reward, Deposit, Withdraw events)
- Any card content using hardcoded Tailwind color classes

**Root Cause**: Hardcoded `bg-green-50`, `bg-blue-50`, `bg-orange-50` with `border-green-200`, etc. that bypass the sophisticated OKLCH color system.

## 🎯 Fix Plan

### 1. Identify Problem Areas
- **Location**: `/packages/frontend/src/app/dashboard/page.tsx` (lines 510-580)
- **Specific Issues**:
  - `bg-green-50 border-green-200 text-green-600` for reward events
  - `bg-blue-50 border-blue-200 text-blue-600` for deposit events  
  - `bg-orange-50 border-orange-200 text-orange-600` for withdraw events
  - These hardcoded colors don't adapt to dark theme

### 2. Solution Strategy
- **Replace hardcoded colors** with theme-aware semantic classes
- **Use existing OKLCH color system** from the silk theme
- **Maintain visual hierarchy** while ensuring proper contrast
- **Test in both light and dark modes**

### 3. Implementation Steps
1. **Audit all hardcoded color classes** in dashboard components
2. **Create semantic color mappings** for event types (success, info, warning)
3. **Replace hardcoded classes** with theme-aware alternatives
4. **Test contrast ratios** in both themes
5. **Verify accessibility compliance**

### 4. Expected Outcome
- ✅ Proper contrast in both light and dark themes
- ✅ Consistent with existing OKLCH color system
- ✅ Maintains visual hierarchy and readability
- ✅ Accessible color combinations (WCAG 2.1 compliant)

---

## 🔧 Technical Notes

**Current Color System**: The project uses a sophisticated OKLCH-based "silk" theme with proper dark/light mode support.

**Files to Modify**:
- `/packages/frontend/src/app/dashboard/page.tsx` (primary focus)
- Any other components using hardcoded Tailwind color classes

**Testing Required**:
- Visual testing in both light and dark themes
- Contrast ratio validation
- Cross-browser compatibility check
