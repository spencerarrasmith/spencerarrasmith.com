## Overview

A Monte Carlo path tracer written in C++17 with a BVH acceleration structure.
Renders at ~40ms per frame on a Ryzen 9.

## Implementation

The core loop traces rays recursively until a depth limit or Russian roulette
termination. Materials are physically-based — diffuse, metal, and dielectric.

```cpp
Color ray_color(const Ray& r, const Hittable& world, int depth) {
    if (depth <= 0) return Color(0, 0, 0);
    HitRecord rec;
    if (world.hit(r, 0.001, infinity, rec)) {
        Ray scattered;
        Color attenuation;
        if (rec.mat->scatter(r, rec, attenuation, scattered))
            return attenuation * ray_color(scattered, world, depth - 1);
        return Color(0, 0, 0);
    }
    // Background gradient
    Vec3 unit = unit_vector(r.direction());
    auto t = 0.5 * (unit.y() + 1.0);
    return (1.0 - t) * Color(1, 1, 1) + t * Color(0.5, 0.7, 1.0);
}
```

## Performance

| Scene complexity | Render time |
|---|---|
| Cornell box | 12ms |
| Full scene, 1M triangles | 40ms |