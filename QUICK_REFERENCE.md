# Multi-Layer Sprite System - Quick Reference

## File Locations

```
/src/lib/animation/
├── CharacterRenderer.ts          # Main sprite engine (REFACTORED)
└── jobTypeHelper.ts              # Job type utilities (NEW)

/src/lib/
└── game.ts                       # Game logic (UPDATED)

/home/ttsuj/tauri-migration-workspace/
├── SPRITE_LAYERING_IMPLEMENTATION.md  # Full documentation
├── VISUAL_TESTING_GUIDE.md           # Testing checklist
└── QUICK_REFERENCE.md                # This file
```

## Key Type Definitions

```typescript
// Job types
type JobType = 'developer' | 'sales' | 'marketing' | 'manager'

// Animation states
type AnimationState = 'idle' | 'working' | 'stressed'

// Layer structure
interface CharacterLayerSprites {
  base: Phaser.GameObjects.Sprite
  clothing_bottom: Phaser.GameObjects.Sprite
  clothing_top: Phaser.GameObjects.Sprite
  accessory: Phaser.GameObjects.Sprite
  badge: Phaser.GameObjects.Sprite
}
```

## API Reference

### Creating Characters

```typescript
// Automatic job type determination
const jobType = determineJobType(employee)
characterScene.addCharacter(employeeId, x, y, jobType)

// Returns: Phaser.GameObjects.Container with 5 layer sprites
```

### Changing Animations

```typescript
// All 5 layers animate synchronously
characterScene.setAnimation(employeeId, 'idle')      // 2 fps, gentle breathing
characterScene.setAnimation(employeeId, 'working')   // 5 fps, active motion
characterScene.setAnimation(employeeId, 'stressed')  // 9 fps, fast motion
```

### Accessing Character Data

```typescript
const container = characterScene.getAllCharacters().get(employeeId)
const jobType = container.getData('jobType')
const layers = container.getData('layers')
const employeeId = container.getData('employeeId')
```

### Removing Characters

```typescript
characterScene.removeCharacter(employeeId)      // Remove single character
characterScene.clearAllCharacters()             // Remove all characters
```

## Job Type Visual Quick Guide

| Job | Color | Bottom | Top | Accessory | Badge | Hair |
|-----|-------|--------|-----|-----------|-------|------|
| 👨‍💻 Developer | Blue #4A90E2 | Dark blue jeans | Blue hoodie | Headphones/glasses | 💻 Laptop | Messy |
| 📞 Sales | Red #FF6B6B | Black pants | Dark suit + tie | Phone | 📞 Phone | Slicked |
| 📊 Marketing | Teal #50E3C2 | Khaki pants | Teal jacket | Tablet/board | 📊 Chart | Creative |
| 📋 Manager | Navy #34495E | Dark pants | Navy suit | Watch/document | 📋 Clipboard | Formal |

## Job Type Assignment Logic

```typescript
determineJobType(employee) {
  // Priority order:
  1. employee.jobType (if already set)
  2. employee.department mapping:
     - development → developer
     - sales → sales
     - marketing → marketing
     - management → manager
  3. Highest skill:
     - technical → developer
     - sales → sales
     - planning → marketing
     - management → manager
  4. Default: developer
}
```

## Animation Frame Structure

```
Frame Index:  0    1    2    3    4    5    6    7
State:       [--- Idle (2fps) ---][-- Working (5fps) --]
Motion:      Still Up  Still Down  Type  Up   Type  Up
```

## Layer Drawing Order (Bottom to Top)

1. **Base** - Body outline, head, hands (shared)
2. **Bottom** - Pants, shoes (job-specific)
3. **Top** - Shirt, jacket, hair (job-specific)
4. **Accessory** - Glasses, phone, etc. (job-specific)
5. **Badge** - Job icon on chest (job-specific)

## Console Debugging Flags

```typescript
// Check these console messages:
'[CharacterScene] Creating multi-layer procedural sprites...'
'[CharacterScene] Multi-layer textures & animations ready...'
'[CharacterScene] Adding layered character X (job) at (x, y)'
'[CharacterScene] Changing animation for X: state1 -> state2'
```

## Common Code Patterns

### Get Job Type from Employee
```typescript
import { determineJobType } from './animation/jobTypeHelper'

const jobType = determineJobType(employee)
console.log(jobType)  // 'developer' | 'sales' | 'marketing' | 'manager'
```

### Get Job Type Colors
```typescript
import { getJobTypeColor, getJobTypeName, getJobTypeIcon } from './animation/jobTypeHelper'

const color = getJobTypeColor('developer')  // '#4A90E2'
const name = getJobTypeName('developer')    // '開発者'
const icon = getJobTypeIcon('developer')    // '💻'
```

### Iterate All Characters
```typescript
characterScene.getAllCharacters().forEach((container, employeeId) => {
  const jobType = container.getData('jobType')
  const layers = container.getData('layers')
  console.log(`Employee ${employeeId} is a ${jobType}`)
})
```

## Performance Tips

1. **Don't recreate characters frequently** - Containers are expensive to create
2. **Reuse animations** - Animations are shared across all characters
3. **Batch operations** - Group character additions together
4. **Monitor FPS** - Should stay above 30fps with 10+ characters

## Troubleshooting Checklist

- [ ] Import includes `type JobType`
- [ ] `determineJobType()` function exists
- [ ] Employee has `abilities` or `department` property
- [ ] CharacterScene is initialized before adding characters
- [ ] jobType parameter passed to `addCharacter()`
- [ ] Container stored in characterSprites Map

## Integration Points

### Where game.ts was modified:
1. **Line 7** - Added `JobType` to imports
2. **Line 774** - Added `determineJobType()` function
3. **Line 1104** - Added job type determination before addCharacter
4. **Line 2229** - Added job type determination for new hires

## Quick Commands

```bash
# Build the project
npm run build

# Run development server
npm run dev

# Check for TypeScript errors
npx tsc --noEmit

# View file changes
git diff src/lib/animation/CharacterRenderer.ts
git diff src/lib/game.ts
```

## Key Metrics

- **Sprite Size:** 48x48 pixels
- **Frame Count:** 8 frames per animation
- **Layer Count:** 5 layers per character
- **Job Types:** 4 types (developer, sales, marketing, manager)
- **Animation States:** 3 states (idle, working, stressed)
- **Textures Generated:** 1 base + 16 job-specific (4 jobs × 4 layers) = 17 total

## Related Documentation

- Full implementation details: `SPRITE_LAYERING_IMPLEMENTATION.md`
- Testing procedures: `VISUAL_TESTING_GUIDE.md`
- Phaser 3 docs: https://photonstorm.github.io/phaser3-docs/

---

**Version:** 1.0
**Last Updated:** 2025-10-28
