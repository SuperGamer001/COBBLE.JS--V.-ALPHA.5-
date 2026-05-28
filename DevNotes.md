# Developer notes

## Helpful notes by "thrax" from Discord:
```
Minor quibble.. in your mesh factory for "cube" and "sphere" they don't share material + geometry..
you could instead make a static cube+sphere mesh, and then simply return primitiveCache['cube'].clone()
```

---

```
another useful abstraction you can bake in early on, is storing the current And previous transform state of objects... so you can run your physics/simulation at a different rate than your display..
so then all your scripts don't have to worry about deltaT.. they just run at a fixed framerate.. and each frame, the transformComponent interpolates between the previous and current snapshot to match the frame time.
You can do similar abstractions for networking... just the idea that given a time T you can get an interpolated "current" state of an object.. can unshackle you from the "heavy updates every rendered frame" bottleneck.
in exchange for heavy updates at 60fps.. renderer running at 144fps... / whatever the users display is at. 
``