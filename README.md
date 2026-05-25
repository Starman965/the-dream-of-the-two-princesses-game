# The Dream of the Two Princesses

A small Godot storybook adventure based on Naomi's book, **The Two Princesses**.

## Play Locally

Open the project in Godot 4.6.3:

```bash
/Applications/Godot.app/Contents/MacOS/Godot --editor --path .
```

Press Play. The game is click/tap friendly:

1. Find the magic mirror.
2. Follow the castle path.
3. Sneak the golden key from the forest house.
4. Wake Jax and Lily in the dragon cave.
5. Watch Emily fly toward the castle.
6. Replay the dream.

## Web / GitHub Pages

The project includes a Web export preset. To publish later:

1. Install Godot 4.6.3 export templates.
2. Export the `Web` preset to `build/web/index.html`.
3. Commit the exported `build/web` files to a GitHub Pages branch or publish them with a GitHub Pages workflow.

## Generated Art

The background art was generated with the built-in image generation workflow and copied into:

- `assets/art/bedroom.png`
- `assets/art/meadow_castle.png`
- `assets/art/forest_witch.png`
- `assets/art/dragon_cave.png`

Original generated files remain under the Codex generated-images folder.

## Character Consistency

The current build now has an art bible at `docs/art_bible.md` and reference sheets at:

- `assets/reference/princesses_reference.png`
- `assets/reference/dragons_reference.png`

Use these as the target for future regenerated scenes. The first four playable backgrounds are still prototype scene art and should be replaced gradually with reference-checked versions.

## Cutscene

The dragon-flight video from Messages was copied into `assets/video/dragon_flight.mov`.
For Godot/web compatibility, it was also converted into a 10 fps image-sequence cutscene under
`assets/video/dragon_flight_frames/`.
