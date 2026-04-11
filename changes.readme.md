# UI Audit Edits - Phase 1

1. **`src/theme.js`**: Added global tokens for `RADIUS`, `SPACING`, `TEXT_STYLES`, and `SHADOWS`. Introduced `CARD` style. Kept `COLORS` and `GAPS` untouched.
2. **`src/utils/useFonts.js`**: Created custom hook `useAppFonts` to load Outfit, Inter, and JetBrainsMono from `@expo-google-fonts`.
3. **`App.js`**: Imported and integrated `useAppFonts`. Delays rendering the navigator until `fontsLoaded` is true.
4. **`src/components/NodeCard.js`**: Replaced hardcoded `8px` borders with `RADIUS.lg` (16px). Removed custom border lines to let `SHADOWS.md` do the work. Swapped font on purely text labels to `TEXT_STYLES.h4` while retaining `FONTS.mono` on data values.
5. **`src/components/NPKBar.js`**: Replaced hardcoded `8px` borders with `RADIUS.lg`. Removed inline borders. Converted label fonts to `TEXT_STYLES.h4`.
6. **`src/components/NPKResultBox.js`**: Replaced hardcoded `8px` borders with `RADIUS.lg`. Removed borders to unify design system. Label fonts updated to `TEXT_STYLES.h4`.
7. **`src/components/AdvisoryCard.js`**: Scaled down the border radius from `32px` to `RADIUS.xl` (20px). Stripped internal border lines to give a cohesive glass/shadow look.

# UI Audit Edits - Phase 2 (Entry Experience)

1. **`src/screens/SplashScreen.js`**: Built an animated initial screen (spring scaling effect + crossfade) that checks global states via `AsyncStorage` (`authFarmer` and `hasOnboarded`).
2. **`src/screens/OnboardingScreen.js`**: Created a highly performant 3-slide pager using native `FlatList` component along with slide dot indicators utilizing `CARD`, `RADIUS`, and `TEXT_STYLES`.
3. **`src/screens/LoginScreen.js`**: Styled and polished components with brand new `TEXT_STYLES`. Cancelled request for OTP logic per instructions and maintained `password`-style auth logic, whilst hooking it natively into global `.replace('App')` Stack behaviour.
4. **`src/navigation/AppNavigator.js`**: Restructured architecture heavily. Replaced the `State`-based tab navigator switch approach with a proper `RootStack` (`createStackNavigator`) spanning Splash -> Onboarding -> Login -> App, delegating routing state out of re-renders. 
