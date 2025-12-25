import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * PostProcessing - Adds bloom effect for sci-fi holographic glow
 *
 * The bloom effect samples bright pixels and bleeds them outward,
 * creating the authentic light-emission effect seen in sci-fi interfaces.
 *
 * Our meshBasicMaterial with bright colors (cyan, orange, magenta)
 * will naturally trigger bloom due to high luminance values.
 */
const PostProcessing = () => {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}           // Glow strength (0.4-0.6 range is good)
        luminanceThreshold={0.2}  // Lower threshold = more elements bloom
        luminanceSmoothing={0.9}  // Smooth transition at threshold edge
        mipmapBlur={true}         // Better quality blur
        radius={0.4}              // Blur spread radius
      />
    </EffectComposer>
  );
};

export default PostProcessing;
