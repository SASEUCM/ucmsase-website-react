import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { View } from "@aws-amplify/ui-react";

export default function AboutUs({ scene, aboutUsObjectRef }) {
  const groupRef = useRef(null);

  useEffect(() => {
    if (!scene) return; // In case scene isn't yet available

    const fontLoader = new FontLoader();

    fontLoader.load(
      '/fonts/helvetiker_regular.typeface.json',
      (font) => {
        if (!font) {
          console.error("Font is null or undefined after loading!");
          return;
        }

        // --- "Welcome to SASE..." Text ---
        const headingGeometry = new TextGeometry('Welcome to SASE\nat UC Merced', {
          font: font,
          size: 0.5,
          height: 0.1,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.01,
          bevelOffset: 0,
          bevelSegments: 5
        });
        const headingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const headingMesh = new THREE.Mesh(headingGeometry, headingMaterial);
        headingGeometry.computeBoundingBox();
        const headingWidth = headingGeometry.boundingBox
          ? headingGeometry.boundingBox.max.x - headingGeometry.boundingBox.min.x
          : 5;
        headingMesh.position.x = -headingWidth / 2;
        headingMesh.position.y = 1;

        // --- "Empowering Asian heritage..." Text ---
        const descriptionGeometry = new TextGeometry(
          'Empowering Asian heritage scientists\nand engineers through leadership,\nprofessional development,\nand a celebration of diversity.',
          {
            font: font,
            size: 0.2,
            height: 0.05,
            curveSegments: 6,
            bevelEnabled: false,
          }
        );
        const descriptionMaterial = new THREE.MeshLambertMaterial({ color: 0xdddddd });
        const descriptionMesh = new THREE.Mesh(descriptionGeometry, descriptionMaterial);
        descriptionGeometry.computeBoundingBox();
        const descriptionWidth = descriptionGeometry.boundingBox
          ? descriptionGeometry.boundingBox.max.x - descriptionGeometry.boundingBox.min.x
          : 5;
        descriptionMesh.position.x = -descriptionWidth / 2;
        descriptionMesh.position.y = -0.5;
        descriptionMesh.position.z = 0.1;

        // --- Rotating Cube ---
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x007bff });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, -1.5, 0);

        // Group them
        const group = new THREE.Group();
        group.add(headingMesh, descriptionMesh, cube);

        scene.add(group);
        aboutUsObjectRef.current = group;
        groupRef.current = group;

        // Simple rotation for the cube
        const animateCube = () => {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          requestAnimationFrame(animateCube);
        };
        animateCube();
      },
      undefined,
      (error) => {
        console.error('An error occurred while loading the font.', error);
      }
    );
  }, [scene, aboutUsObjectRef]);

  return (
    <View>
      {/* Empty View for layout; the 3D objects are added directly to the Three.js scene. */}
    </View>
  );
}
