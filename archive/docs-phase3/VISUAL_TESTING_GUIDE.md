# Visual Testing Guide for Multi-Layer Sprite System

## Quick Start Testing

### 1. Start the Development Server
```bash
cd /home/ttsuj/tauri-migration-workspace
npm run dev
```

### 2. Open Browser Console
Press F12 to open DevTools and check for:
- `[CharacterScene] Creating multi-layer procedural sprites...`
- `[CharacterScene] Multi-layer textures & animations ready for job types: developer, sales, marketing, manager`

## Visual Verification Checklist

### Character Rendering
- [ ] All characters appear on screen (not blank/missing)
- [ ] Characters have proper proportions (48x48px)
- [ ] No visual glitches or layer misalignment
- [ ] Colors match job type themes

### Job Type Visual Differences

#### Developer (Blue #4A90E2)
- [ ] Wearing blue hoodie/casual clothing
- [ ] Dark blue jeans
- [ ] Headphones OR glasses visible
- [ ] Small laptop badge on chest
- [ ] Messy hair style

#### Sales (Red/Orange #FF6B6B)
- [ ] Wearing dark formal suit
- [ ] Red tie visible
- [ ] Black dress pants
- [ ] Phone accessory visible
- [ ] Professional slicked hair

#### Marketing (Teal #50E3C2)
- [ ] Wearing teal/green smart casual jacket
- [ ] Khaki/beige pants
- [ ] Tablet or presentation board visible
- [ ] Chart badge on chest
- [ ] Creative hair with highlights

#### Manager (Dark Blue #34495E)
- [ ] Wearing dark executive suit
- [ ] White shirt collar visible
- [ ] Dark formal pants
- [ ] Watch or document visible
- [ ] Neat formal hair

### Animation States

#### Idle Animation (Default)
- [ ] Gentle breathing motion (slight up/down movement)
- [ ] Arms at sides
- [ ] Smooth 2 fps animation
- [ ] All 5 layers move together
- [ ] No jittering or desync

#### Working Animation
- [ ] More active motion (typing/working gestures)
- [ ] Arms moving slightly
- [ ] Faster animation (5 fps)
- [ ] All layers synchronized
- [ ] Expression changes to focused

#### Stressed Animation
- [ ] Same motion as working but faster
- [ ] Very fast animation (9 fps)
- [ ] Consistent across all layers
- [ ] Maintains visual quality

### Layer Synchronization Test
1. Watch a single character for 10 seconds
2. Verify all body parts move together:
   - [ ] Head, body, arms, legs move as one unit
   - [ ] Clothing follows body movement
   - [ ] Accessories don't float or lag
   - [ ] Badge stays in correct position

### Job Type Assignment Test

#### Test 1: Initial Employee
1. Start new game
2. Check initial employee (山田 太郎)
3. Verify:
   - [ ] Has department: "development"
   - [ ] Appears as Developer (blue hoodie)
   - [ ] Console shows correct job type

#### Test 2: Skill-Based Assignment
1. Hire new employees
2. Check employees with different highest skills:
   - High Technical → [ ] Appears as Developer
   - High Sales → [ ] Appears as Sales
   - High Planning → [ ] Appears as Marketing
   - High Management → [ ] Appears as Manager

#### Test 3: Department-Based Assignment
1. Assign employees to departments
2. Verify visual updates match department:
   - Development dept → [ ] Developer appearance
   - Sales dept → [ ] Sales appearance
   - Marketing dept → [ ] Marketing appearance
   - Management dept → [ ] Manager appearance

## Console Debugging

### Expected Console Output (on game start)
```
[CharacterRenderer] Initializing Phaser game in #canvas-container
[CharacterScene] Preloading assets...
[CharacterScene] Creating multi-layer procedural sprites...
[CharacterScene] Multi-layer textures & animations ready for job types: developer, sales, marketing, manager
[CharacterScene] Adding layered character 1 (developer) at (100, 100)
```

### Expected Console Output (on animation change)
```
[CharacterScene] Changing animation for 1 (developer): idle -> working
```

### Error Indicators to Watch For
❌ `Container not found for employee X` - Character wasn't created properly
❌ `Texture with key 'X' not found` - Layer texture missing
❌ `Animation 'X' not found` - Animation definition missing

## Performance Testing

### Frame Rate Check
1. Open browser DevTools
2. Go to Performance tab
3. Record for 10 seconds
4. Check:
   - [ ] FPS stays above 30 (preferably 60)
   - [ ] No significant frame drops
   - [ ] CPU usage reasonable

### Memory Check
1. Open DevTools Memory tab
2. Take heap snapshot
3. Play for 5 minutes
4. Take another snapshot
5. Verify:
   - [ ] No significant memory leaks
   - [ ] Texture memory stable
   - [ ] No orphaned containers

### Stress Test (10+ Characters)
1. Progress game to hire 10+ employees
2. Verify:
   - [ ] All characters render correctly
   - [ ] Frame rate remains smooth
   - [ ] No visual glitches
   - [ ] Animation sync maintained

## Common Issues and Solutions

### Issue: Characters Not Appearing
**Symptoms:** Blank screen, no sprites visible
**Solutions:**
1. Check console for texture creation errors
2. Verify Phaser initialized correctly
3. Check CSS doesn't hide canvas

### Issue: Layers Misaligned
**Symptoms:** Body parts not lining up, floating accessories
**Solutions:**
1. Check frame pose calculations
2. Verify all layers use same centerX/centerY
3. Inspect bodyOffsetY values

### Issue: Animation Desync
**Symptoms:** Some layers animate differently
**Solutions:**
1. Verify all layers have same frame count (8)
2. Check animation frame rates match
3. Ensure all layers created properly

### Issue: Wrong Job Type Assigned
**Symptoms:** Developer looks like Sales, etc.
**Solutions:**
1. Check `determineJobType()` function logic
2. Verify employee abilities data
3. Check department mapping

## Visual Comparison Reference

### Expected Color Themes
| Job Type | Primary Color | Secondary Color | Accent Color |
|----------|--------------|-----------------|--------------|
| Developer | #4A90E2 (Blue) | #78b3ff (Light Blue) | #1a2433 (Dark) |
| Sales | #FF6B6B (Red) | #2e3440 (Dark Gray) | #ffe0de (Light Pink) |
| Marketing | #50E3C2 (Teal) | #c4a978 (Tan) | #2c9e83 (Dark Teal) |
| Manager | #34495E (Navy) | #415d78 (Blue Gray) | #dbe4ee (Light Gray) |

### Expected Accessory Patterns
- **Developer:** Alternates between headphones (even frames) and glasses (odd frames)
- **Sales:** Phone held in right hand
- **Marketing:** Tablet/board visible (changes based on idle/working)
- **Manager:** Watch on left wrist OR document in hand

## Browser Compatibility Testing

### Chrome/Edge (Recommended)
- [ ] All features work
- [ ] Animations smooth
- [ ] Colors render correctly

### Firefox
- [ ] Canvas rendering works
- [ ] Phaser initializes correctly
- [ ] Performance acceptable

### Safari (if available)
- [ ] WebGL/Canvas support working
- [ ] No visual artifacts
- [ ] Animation timing correct

## Reporting Issues

If you find visual bugs, report with:
1. **Screenshot** of the issue
2. **Browser** and version
3. **Console errors** (if any)
4. **Steps to reproduce**
5. **Expected vs actual** behavior

## Success Criteria

The system passes testing if:
- ✅ All 4 job types render with distinct visuals
- ✅ Animations are smooth and synchronized across all layers
- ✅ Job type assignment works correctly based on skills/department
- ✅ Performance remains stable with 10+ characters
- ✅ No console errors during normal gameplay
- ✅ Character removal/clearing works properly
- ✅ Frame rate stays above 30 FPS

---

**Last Updated:** 2025-10-28
**System Version:** Multi-Layer Sprite System v1.0
