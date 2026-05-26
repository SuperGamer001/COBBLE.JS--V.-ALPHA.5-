// Platforming.js — A custom script using the COBBLE.js engine.

import * as THREE from "three";
import Cobble from "../COBBLE/main.js";
import EntityManager from "../COBBLE/plugins/entityManager.js";
import Camera from "../COBBLE/plugins/camera.js";
import PhysicsManager from "../COBBLE/plugins/physicsManager.js";

// ============================================================
//  Engine + Plugin Setup
// ============================================================

const cobble = new Cobble();
const entityManager = new EntityManager();
cobble.addPlugin(entityManager);
cobble.skyColor = 0x87aaeb; // light blue

const physics = new PhysicsManager();
cobble.addPlugin(physics);

// Change global gravity for everyone
physics.defaults.gravity.set(0, -20, 0);
physics.defaults.restitution = 0; // Prevent bouncing
physics.defaults.friction = 0; // Allow sliding


// ============================================================
//  Character Configs
// ============================================================

const SONIC = {
    hasEars: true,
    hasSocks: true,
    handSize: 0.15,
    colors: {
        body:  0x0000ff,
        skin:  0xffcc99,
        mouth: 0xbb8855,
        shoes: 0xff0000,
        eyes:  0x00ff00,
        hands: 0xffffff,
    },
    head: {
        scale:   { x: 0.5,  y: 0.5,  z: 0.25 },
        muzzle:  { scale: { x: 0.52, y: 0.15, z: 0.1  }, position: { x: 0,    y: -0.18, z: 0.1  } },
        mouth:   { position: { x: 0.1, y: -0.17, z: 0.101 } },
        nose:    { position: { x: 0,   y: -0.12, z: 0.09  } },
        eyes:    { scale: { x: 0.51, y: 0.25, z: 0.1  }, position: { x: 0,      y:  0.01, z: 0.08  } },
        eyelids: { scale: { x: 0.52, y: 0.25, z: 0.1  }, position: { x: -0.001, y:  0.02, z: 0.08  } },
        brows:   { scale: { x: 0.1,  y: 0.2,  z: 0.1  }, position: { x: 0,      y:  0.1,  z: 0.084 }, rx: -0.1 },
    },
    quills: [
        { x:  0,    y:  0.14, z: 0.07, rx: -1.1, ry: 0, rz:  0,    sx: 0.25, sy: 0.65, sz: 0.25 },
        { x: -0.13, y:  0.13, z: 0,    rx: -1.4, ry: 0, rz:  0.4,  sx: 0.25, sy: 0.5,  sz: 0.25 },
        { x:  0.13, y:  0.13, z: 0,    rx: -1.4, ry: 0, rz: -0.4,  sx: 0.25, sy: 0.5,  sz: 0.25 },
        { x:  0,    y: -0.1,  z: 0.02, rx: -1.4, ry: 0, rz:  0,    sx: 0.25, sy: 0.6,  sz: 0.25 },
        { x: -0.1,  y: -0.05, z: 0,    rx: -2,   ry: 0, rz:  0.4,  sx: 0.25, sy: 0.6,  sz: 0.25 },
        { x:  0.1,  y: -0.05, z: 0,    rx: -2,   ry: 0, rz: -0.4,  sx: 0.25, sy: 0.6,  sz: 0.25 },
    ],
    stomach: (torso) => {
        const stomach = entityManager.addBox();
        stomach.setScale({ x: 0.25, y: 0.35, z: 0.001 });
        stomach.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
        stomach.entity.position.z = 0.125;
        torso.attachEntity(stomach);
    },
    shoes: (foot, side) => {
        const strap = entityManager.addBox();
        strap.setScale({ x: 0.21, y: 0.16, z: 0.1 });
        strap.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        strap.entity.position.y = 0.02;
        foot.attachEntity(strap);

        const buckle = entityManager.addBox();
        buckle.setScale({ x: 0.05, y: 0.06, z: 0.12 });
        buckle.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffd700 }));
        buckle.entity.position.y = -0.03;
        buckle.entity.position.x = side === "left" ? -0.1 : 0.1;
        foot.attachEntity(buckle);
    },
};

const TAILS = {
    hasEars: false,
    hasSocks: true,
    handSize: 0.13,
    colors: {
        body:  0xff9900,
        skin:  0xff9900,
        mouth: 0xcccccc,
        shoes: 0xdd2222,
        eyes:  0x44aaff,
        hands: 0xffffff,
        socks: 0xffffff,
    },
    head: {
        scale:   { x: 0.5,  y: 0.5,  z: 0.4 },
        muzzle:  { scale: { x: 0.52, y: 0.15, z: 0.1  }, position: { x: 0,    y: -0.18, z: 0.17   }, color: 0xffffff },
        mouth:   { position: { x: 0, y: -0.18, z: 0.171 } },
        nose:    { position: { x: 0,   y: -0.12, z: 0.16  } },
        eyes:    { scale: { x: 0.51, y: 0.25, z: 0.1  }, position: { x: 0,    y:  0.01, z: 0.151  } },
        eyelids: { scale: { x: 0.521, y: 0.25, z: 0.241  }, position: { x: -0.001,    y:  0.02, z: 0.09  } },
        brows:   { scale: { x: 0.1,  y: 0.25, z: 0.1  }, position: { x: 0,    y:  0.015,  z: 0.16 }, rx: -0.05 },
    },
    quills: [
        // Hair tuffs
        { x: 0, y:  0.17, z: 0.15,    rx: 0.2, ry: 0, rz:  0,    sx: 0.05, sy: 0.4, sz: 0.1 },
        { x: 0, y:  0.15, z: 0.15,    rx: 0.7, ry: 0, rz:  0,    sx: 0.05, sy: 0.4, sz: 0.1 },
        { x: 0, y:  0.13, z: 0.15,    rx: 1.2,   ry: 0, rz:  0,  sx: 0.05, sy: 0.4, sz: 0.1 },

        // Ears
        { x: -0.2, y: 0.18, z: 0,     rx: -0.2, ry: 0, rz: 0.2,    sx: 0.25, sy: 0.3, sz: 0.1 },
        { x: 0.2, y: 0.18, z: 0,      rx: -0.2, ry: 0, rz: -0.2,   sx: 0.25, sy: 0.3, sz: 0.1 },

        // muddle fluff
        { x: -0.22, y: -0.15, z: 0.1,    rx: 0, ry: -0.2, rz: 1.5,     sx: 0.2, sy: 0.2, sz: 0.1,    color: 0xffffff },
        { x: 0.22, y: -0.15, z: 0.1,     rx: 0, ry: 0.2, rz: -1.5,    sx: 0.2, sy: 0.2, sz: 0.1,    color: 0xffffff },
    ],
    stomach: (torso) => {
        // White chest patch
        const chest = entityManager.addBox();
        chest.setScale({ x: 0.25, y: 0.35, z: 0.001 });
        chest.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        chest.entity.position.z = 0.125;
        torso.attachEntity(chest);

        // Twin tails — each is a pivot bone angled backward, with a body segment and white fluffy tip
        for (const [sign, rz] of [[-1, 0.28], [1, -0.28]]) {
            const tailPivot = entityManager.addBox();
            tailPivot.setScale({ x: 0, y: 0, z: 0 });
            tailPivot.entity.position.set(sign * 0.09, -0.1, -0.12);
            tailPivot.entity.rotation.set(2.3, 0, rz);
            torso.attachEntity(tailPivot);

            const tailBody = entityManager.addBox();
            tailBody.setScale({ x: 0.11, y: 0.42, z: 0.11 });
            tailBody.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xff9900 }));
            tailBody.entity.position.y = -0.21;
            tailPivot.attachEntity(tailBody);

            const tailTip = entityManager.addBox();
            tailTip.setScale({ x: 0.19, y: 0.19, z: 0.19 });
            tailTip.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
            tailTip.entity.position.y = -0.21;
            tailBody.attachEntity(tailTip);
        }
    },
    shoes: (foot, side) => {
        // White toe cap
        const toeCap = entityManager.addBox();
        toeCap.setScale({ x: 0.18, y: 0.13, z: 0.22 });
        toeCap.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        toeCap.entity.position.set(0, 0.01, 0.12);
        foot.attachEntity(toeCap);

        // Red strap across the middle
        const strap = entityManager.addBox();
        strap.setScale({ x: 0.21, y: 0.09, z: 0.08 });
        strap.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xdd2222 }));
        strap.entity.position.y = 0.04;
        foot.attachEntity(strap);
    },
};

const KNUCKLES = {
    hasEars: false,
    hasSocks: true,
    handSize: 0.2,
    colors: {
        body:  0xff0000,
        skin:  0xffcc99,
        mouth: 0xbb8855,
        shoes: 0xff0000,
        eyes:  0xbb0088,
        hands: 0xffffff,
        socks: 0x22ff22,
    },
    head: {
        scale:   { x: 0.55, y: 0.55, z: 0.4  },
        muzzle:  { scale: { x: 0.56, y: 0.15, z: 0.15  }, position: { x: 0,    y: -0.2,  z: 0.16  } },
        mouth:   { position: { x: 0,   y: -0.19, z: 0.186 } },
        nose:    { position: { x: 0,   y: -0.14, z: 0.15  } },
        eyes:    { scale: { x: 0.51, y: 0.2,  z: 0.1  }, position: { x: 0,    y: -0.01, z: 0.151 } },
        eyelids: { scale: { x: 0.52, y: 0.25, z: 0.25  }, position: { x: -0.001,    y:  0.02, z: 0.08  } },
        brows:   { scale: { x: 0.1,  y: 0.3,  z: 0.1  }, position: { x: 0,    y:  0.04, z: 0.154 }, rx: -0.03 },
    },
    quills: [
        { x:  0, y:  0.26, z: -0.15, rx: -2.8, ry: 0, rz:  0, sx: 0.5, sy: 0.65, sz: 0.15 },
        { x:  0, y:  0.24, z: -0.18, rx: -2.7, ry: 0, rz:  0, sx: 0.3, sy: 0.5, sz: 0.15 },

        { x:  0.2, y: 0.26,  z: 0, rx: 0, ry: 0, rz:  -2.8, sx: 0.15, sy: 0.6, sz: 0.4 },
        { x:  0.2, y: 0.24,  z: 0, rx: 0, ry: 0, rz:  -2.7, sx: 0.2, sy: 0.45, sz: 0.2 },

        { x: -0.2, y: 0.26,  z: 0, rx: 0, ry: 0, rz:   2.8, sx: 0.15, sy: 0.6, sz: 0.4 },
        { x: -0.2, y: 0.24,  z: 0, rx: 0, ry: 0, rz:   2.7, sx: 0.2, sy: 0.45, sz: 0.2 },
    ],
    stomach: (torso) => {
        const stomach = entityManager.addBox();
        stomach.setScale({ x: 0.25, y: 0.1, z: 0.001 });
        stomach.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        stomach.entity.position.y = 0.1;
        stomach.entity.position.z = 0.125;
        torso.attachEntity(stomach);
    },
    shoes: (foot, side) => {
        const strap = entityManager.addBox();
        strap.setScale({ x: 0.21, y: 0.16, z: 0.1 });
        strap.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffff00 }));
        strap.entity.position.y = 0.02;
        foot.attachEntity(strap);

        const buckle = entityManager.addBox();
        buckle.setScale({ x: 0.1, y: 0.06, z: 0.15 });
        buckle.applyMaterial(new THREE.MeshStandardMaterial({ color: 0x333333 }));
        buckle.entity.position.y = 0.08;
        buckle.entity.position.z = 0.08;
        foot.attachEntity(buckle);
    },
};

const AMY = {
    hasEars: true,
    hasSocks: false,
    handSize: 0.13,
    colors: {
        body:  0xff69b4,
        skin:  0xffcc99,
        mouth: 0xbb8855,
        shoes: 0xdd0000,
        eyes:  0x00cc44,
        hands: 0xffffff,
        torso: 0xdd0000,
    },
    head: {
        scale:   { x: 0.5,  y: 0.5,  z: 0.4 },
        muzzle:  { scale: { x: 0.52, y: 0.15, z: 0.1  }, position: { x: 0,    y: -0.18, z: 0.17   }},
        mouth:   { position: { x: 0, y: -0.18, z: 0.171 } },
        nose:    { position: { x: 0,   y: -0.12, z: 0.16  } },
        eyes:    { scale: { x: 0.51, y: 0.25, z: 0.1  }, position: { x: 0,    y:  0.01, z: 0.151  } },
        eyelids: { scale: { x: 0.52, y: 0.25, z: 0.25  }, position: { x: -0.001,    y:  0.02, z: 0.08  } },
        brows:   { scale: { x: 0.1,  y: 0.2,  z: 0.25  }, position: { x: 0,    y:  0.08,  z: 0.084 }, rx: -0.1 },
    },
    quills: [
        // Long quills sweeping backward (Amy's style)
        { x:  0,    y:  0.2, z: -0.15,    rx: -2.6, ry: 0, rz:  0,    sx: 0.15, sy: 0.5, sz: 0.15 },
        { x:  0.2,    y:  0.2, z: -0.13,  rx: -2.8, ry: 0, rz:  0,    sx: 0.15, sy: 0.5, sz: 0.15 },
        { x:  0.2,    y:  0.2, z: 0,      rx: 0, ry: 0, rz:  -2.8,    sx: 0.15, sy: 0.5, sz: 0.15 },
        { x: -0.2,    y:  0.2, z: -0.13,  rx: -2.8, ry: 0, rz:  0,    sx: 0.15, sy: 0.5, sz: 0.15 },
        { x: -0.2,    y:  0.2, z: 0,      rx: 0, ry: 0, rz:   2.8,    sx: 0.15, sy: 0.5, sz: 0.15 },



        // Red headband — flat horizontal strip
        { x:  0,     y:  0.22, z:  0.1, rx:  0,   ry: 0, rz:  0,    sx: 0.52, sy: 0.04, sz: 0.06, color: 0xdd2222 },
    ],
    stomach: (torso) => {
        // Red dress skirt
        const dress = entityManager.addBox();
        dress.setScale({ x: 0.5, y: 0.15, z: 0.5 });
        dress.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xdd2222 }));
        dress.entity.position.y = -0.15;
        torso.attachEntity(dress);

        const skirt = entityManager.addBox();
        skirt.setScale({ x: 0.351, y: 0.15, z: 0.251 });
        skirt.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        skirt.entity.position.y = -0.12;
        torso.attachEntity(skirt);

        // White collar trim
        const collar = entityManager.addBox();
        collar.setScale({ x: 0.2, y: 0.06, z: 0.001 });
        collar.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        collar.entity.position.y = 0.19;
        collar.entity.position.z = 0.127;
        torso.attachEntity(collar);
    },
    shoes: (foot, side) => {
        // White boot overlay
        const toe = entityManager.addBox();
        toe.setScale({ x: 0.13, y: 0.13, z: 0.25 });
        toe.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        toe.entity.position.y = 0.02;
        toe.entity.position.z = 0.09;
        foot.attachEntity(toe);

        // Gold buckle
        const buckle = entityManager.addBox();
        buckle.setScale({ x: 0.05, y: 0.06, z: 0.1 });
        buckle.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffd700 }));
        buckle.entity.position.y = 0.03;
        buckle.entity.position.x = side === "left" ? -0.06 : 0.06;
        foot.attachEntity(buckle);
    },
};

const SHADOW = {
    hasEars: true,
    hasSocks: true,
    handSize: 0.15,
    colors: {
        body:  0x111111,
        skin:  0xeebb77,
        mouth: 0xaa7733,
        shoes: 0xffffff,
        eyes:  0xff0000,
        hands: 0xffffff,
        socks: 0xff1100,
    },
    head: {
        scale:   { x: 0.5,  y: 0.5,  z: 0.25 },
        muzzle:  { scale: { x: 0.52, y: 0.15, z: 0.1  }, position: { x: 0,    y: -0.18, z: 0.1  } },
        mouth:   { position: { x: 0.1, y: -0.17, z: 0.101 }, rotation: { x: 0, y: 0, z: 0.3 } },
        nose:    { position: { x: 0,   y: -0.12, z: 0.09  } },
        eyes:    { scale: { x: 0.51, y: 0.2, z: 0.1  }, position: { x: 0,    y:  0, z: 0.08  } },
        eyelids: { scale: { x: 0.52, y: 0.25, z: 0.1  }, position: { x: -0.001, y:  0.02, z: 0.08  } },
        brows:   { scale: { x: 0.1,  y: 0.25,  z: 0.1  }, position: { x: 0,    y:  0.1,  z: 0.084 }, rx: -0.1 },
    },
    quills: [
        { x:  0,    y:  0.14, z: 0.07, rx: -1.1, ry: 0, rz:  0,    sx: 0.25, sy: 0.65, sz: 0.25 },
        { x:  0,    y:  0.227, z: 0.07, rx: -1.1, ry: 0, rz:  0,    sx: 0.2, sy: 0.5, sz: 0.1, color: 0xff0000 },

        { x: -0.13, y:  0.13, z: 0,    rx: -1.4, ry: 0, rz:  0.4,  sx: 0.25, sy: 0.5,  sz: 0.25 },
        { x: -0.13, y:  0.207, z: 0,    rx: -1.4, ry: 0, rz:  0.4,  sx: 0.2, sy: 0.45,  sz: 0.1, color: 0xff0000 },
        { x:  0.32, y:  0.3, z: -0.43,    rx: -1.4, ry: 0, rz: -0.4,  sx: 0.25, sy: 0.08,  sz: 0.3 },

        { x:  0.13, y:  0.13, z: 0,    rx: -1.4, ry: 0, rz: -0.4,  sx: 0.25, sy: 0.5,  sz: 0.25 },
        { x:  0.13, y:  0.207, z: 0,    rx: -1.4, ry: 0, rz: -0.4,  sx: 0.2, sy: 0.45,  sz: 0.1, color: 0xff0000 },
        { x: -0.32, y:  0.3, z: -0.43,    rx: -1.4, ry: 0, rz:  0.4,  sx: 0.25, sy: 0.08,  sz: 0.3 },

        { x:  0,    y: -0.1,  z: 0.02, rx: -1.4, ry: 0, rz:  0,    sx: 0.25, sy: 0.6,  sz: 0.25 },
        { x:  0,    y: -0.022, z: 0.02, rx: -1.4, ry: 0, rz:  0,    sx: 0.2, sy: 0.5,  sz: 0.1, color: 0xff0000 },

        { x: -0.1,  y: -0.05, z: 0,    rx: -2,   ry: 0, rz:  0.4,  sx: 0.25, sy: 0.6,  sz: 0.25 },
        { x: -0.12,  y: -0.01,  z: -0.1,    rx: -2,   ry: 0, rz:  0.4,  sx: 0.2, sy: 0.5,  sz: 0.1, color: 0xff0000 },
        { x: -0.33, y:  -0.18, z: -0.55,    rx: -2, ry: 0, rz:  0.4,  sx: 0.25, sy: 0.08,  sz: 0.3 },

        { x:  0.1,  y: -0.05, z: 0,    rx: -2,   ry: 0, rz: -0.4,  sx: 0.25, sy: 0.6,  sz: 0.25 },
        { x:  0.12,  y: -0.01,  z: -0.1,    rx: -2,   ry: 0, rz: -0.4,  sx: 0.2, sy: 0.5,  sz: 0.1, color: 0xff0000 },
        { x:  0.33, y:  -0.18, z: -0.55,    rx: -2, ry: 0, rz: -0.4,  sx: 0.25, sy: 0.1,  sz: 0.3 },

    ],
    stomach: (torso) => {
        const stomach = entityManager.addBox();
        stomach.setScale({ x: 0.16, y: 0.12, z: 0.001 });
        stomach.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        stomach.entity.position.y = 0.15;
        stomach.entity.position.z = 0.125;
        torso.attachEntity(stomach);
    },
    shoes: (foot, side) => {
        const frame = entityManager.addBox();
        frame.setScale({ x: 0.22, y: 0.06, z: 0.41 });
        frame.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        frame.entity.position.y = -0.05;
        foot.attachEntity(frame);

        const cuff = entityManager.addBox();
        cuff.setScale({ x: 0.18, y: 0.1, z: 0.18 });
        cuff.applyMaterial(new THREE.MeshStandardMaterial({ color: 0xffcc00 })); // gold
        cuff.entity.position.z = -0.08;
        cuff.entity.position.y = 0.05;
        foot.attachEntity(cuff);
    },  
};


// ============================================================
//  Shared Character Builder
// ============================================================

function createSonicCharacter(config) {
    const mat = (color) => new THREE.MeshStandardMaterial({ color });
    const box = () => entityManager.addBox();
    const h = config.head;

    // Hitbox
    const player = box();
    player._visual.material.transparent = true;
    player._visual.material.opacity = 0;
    player.setScale({ x: 0.5, y: 1.8, z: 0.5 });

    // Torso
    const torso = box();
    torso.setScale({ x: 0.35, y: 0.45, z: 0.25 });
    torso.applyMaterial(mat(config.colors.torso ?? config.colors.body));
    torso.entity.position.y = 0.1;
    player.attachEntity(torso);

    config.stomach?.(torso);

    // Neck + Head
    const neck = box();
    neck.setScale({ x: 0.1, y: 0.1, z: 0.1 });
    neck.applyMaterial(mat(config.colors.body));
    neck.entity.position.y = 0.25;
    neck.entity.rotation.order = "YXZ";
    torso.attachEntity(neck);

    const head = box();
    head.setScale(h.scale);
    head.applyMaterial(mat(config.colors.body));
    head.entity.rotation.order = "YXZ";
    head.entity.position.y = 0.3;
    head.entity.position.z = 0.05;
    neck.attachEntity(head);

    // Face — all positions driven by config so they adapt to head depth
    const muzzle = box();
    muzzle.setScale(h.muzzle.scale);
    muzzle.applyMaterial(mat(config.head.muzzle.color ?? config.colors.skin));
    muzzle.entity.position.set(h.muzzle.position.x, h.muzzle.position.y, h.muzzle.position.z);
    head.attachEntity(muzzle);

    const mouth = box();
    mouth.setScale({ x: 0.1, y: 0.05, z: 0.1 });
    mouth.applyMaterial(mat(config.colors.mouth));
    mouth.entity.position.set(h.mouth.position.x, h.mouth.position.y, h.mouth.position.z);
    mouth.entity.rotation.set(h.mouth.rotation?.x ?? 0, h.mouth.rotation?.y ?? 0, h.mouth.rotation?.z ?? 0);
    head.attachEntity(mouth);

    const nose = box();
    nose.setScale({ x: 0.04, y: 0.04, z: 0.2 });
    nose.applyMaterial(mat(0x000000));
    nose.entity.position.set(h.nose.position.x, h.nose.position.y, h.nose.position.z);
    nose.entity.rotation.x = -0.2;
    head.attachEntity(nose);

    const eyes = box();
    eyes.setScale(h.eyes.scale);
    eyes.applyMaterial(mat(0xffffff));
    eyes.entity.position.set(h.eyes.position.x, h.eyes.position.y, h.eyes.position.z);
    head.attachEntity(eyes);

    const eyelids = box();
    eyelids.setScale(h.eyelids.scale);
    eyelids.applyMaterial(mat(config.colors.body));
    eyelids.entity.position.set(h.eyelids.position.x, h.eyelids.position.y, h.eyelids.position.z + 0.002);
    head.attachEntity(eyelids);

    const brows = box();
    brows.setScale(h.brows.scale);
    brows.applyMaterial(mat(config.colors.body));
    brows.entity.position.set(h.brows.position.x, h.brows.position.y, h.brows.position.z);
    brows.entity.rotation.x = h.brows.rx;
    head.attachEntity(brows);

    for (const [xPos] of [[-0.1], [0.1]]) {
        const pupil = box();
        pupil.setScale({ x: 0.05, y: 0.1, z: 0.1 });
        pupil.applyMaterial(mat(0x000000));
        pupil.entity.position.set(xPos, -0.02, 0.001);
        eyes.attachEntity(pupil);

        const iris = box();
        iris.setScale({ x: 0.05, y: 0.05, z: 0.1 });
        iris.applyMaterial(mat(config.colors.eyes));
        iris.entity.position.y = 0.075;
        pupil.attachEntity(iris);
    }

    // Quills — all bones attach directly to head, never to each other
    const quillBones = config.quills.map(q => {
        const bone = box();
        bone.setScale({ x: 0.02, y: 0.02, z: 0.02 });
        bone.entity.position.set(q.x, q.y, q.z ?? 0);
        bone.entity.rotation.set(q.rx ?? 0, q.ry ?? 0, q.rz ?? 0);
        head.attachEntity(bone);

        // In createSonicCharacter, inside the quills .map():
        const visual = box();
        visual.setScale({ x: q.sx, y: q.sy, z: q.sz });
        visual.applyMaterial(mat(q.color ?? config.colors.quills ?? config.colors.body)); // ← change
        visual.entity.position.y = q.sy / 2;
        bone.attachEntity(visual);

        return bone;
    });

    // Ears — skipped entirely if hasEars is false
    if (config.hasEars) {
        for (const [xPos, rz] of [[-0.2, 0.2], [0.2, -0.2]]) {
            const ear = box();
            ear.setScale({ x: 0.15, y: 0.15, z: 0.05 });
            ear.applyMaterial(mat(config.colors.skin));
            ear.entity.position.set(xPos, 0.28, 0);
            ear.entity.rotation.order = "YXZ";
            ear.entity.rotation.z = rz;
            head.attachEntity(ear);
        }
    }

    // Arm builder
    const buildArm = (side) => {
        const sign = side === "left" ? -1 : 1;

        const shoulder = box();
        shoulder.setScale({ x: 0, y: 0, z: 0 });
        shoulder.entity.position.set(sign * 0.25, 0.15, 0);
        shoulder.entity.rotation.order = "YXZ";
        shoulder.entity.rotation.z = sign * 0.5;
        torso.attachEntity(shoulder);

        const upper = box();
        upper.setScale({ x: 0.12, y: 0.3, z: 0.12 });
        upper.applyMaterial(mat(config.colors.skin));
        upper.entity.position.y = -0.1;
        shoulder.attachEntity(upper);

        const elbow = box();
        elbow.setScale({ x: 0, y: 0, z: 0 });
        elbow.entity.position.y = -0.1;
        upper.attachEntity(elbow);

        const lower = box();
        lower.setScale({ x: 0.12, y: 0.2, z: 0.12 });
        lower.applyMaterial(mat(config.colors.skin));
        lower.entity.position.y = -0.1;
        elbow.attachEntity(lower);

        let handSize = config.handSize ?? 0.15;
        const hand = box();
        hand.setScale({ x: handSize, y: handSize, z: handSize });
        hand.applyMaterial(mat(config.colors.hands));
        hand.entity.position.y = -0.17;
        lower.attachEntity(hand);

        return { shoulder, upper, elbow, lower, hand };
    };

    // Leg builder
    const buildLeg = (side) => {
        const sign = side === "left" ? -1 : 1;

        const hip = box();
        hip.setScale({ x: 0, y: 0, z: 0 });
        hip.entity.position.set(sign * 0.12, -0.1, 0);
        torso.attachEntity(hip);

        const upper = box();
        upper.setScale({ x: 0.12, y: 0.4, z: 0.12 });
        upper.applyMaterial(mat(config.colors.body));
        upper.entity.position.y = -0.3;
        hip.attachEntity(upper);

        const knee = box();
        knee.setScale({ x: 0, y: 0, z: 0 });
        knee.entity.position.y = -0.2;
        knee.entity.rotation.x = 2;
        upper.attachEntity(knee);

        const lower = box();
        lower.setScale({ x: 0.12, y: 0.3, z: 0.12 });
        lower.applyMaterial(mat(config.colors.body));
        lower.entity.position.y = -0.15;
        knee.attachEntity(lower);

        const ankle = box();
        if (config.hasSocks) {
            let sockColor = config.colors.socks ?? 0xffffff;
            ankle.setScale({ x: 0.15, y: 0.1, z: 0.15 });
            ankle.applyMaterial(mat(sockColor));
        } else {
            ankle.setScale({ x: 0, y: 0, z: 0 });
        }
        ankle.entity.position.y = -0.1;
        lower.attachEntity(ankle);

        const foot = box();
        foot.setScale({ x: 0.2, y: 0.15, z: 0.4 });
        foot.applyMaterial(mat(config.colors.shoes));
        foot.entity.position.set(0, -0.08, 0.08);
        ankle.attachEntity(foot);

        config.shoes?.(foot, side);

        return { hip, upper, knee, lower, ankle, foot };
    };

    const leftArm  = buildArm("left");
    const rightArm = buildArm("right");
    const leftLeg  = buildLeg("left");
    const rightLeg = buildLeg("right");

    player.bones = {
        neck,
        head,
        torso,
        quills:        quillBones,
        eyes,
        eyelids,
        leftShoulder:  leftArm.shoulder,
        rightShoulder: rightArm.shoulder,
        leftElbow:     leftArm.elbow,
        rightElbow:    rightArm.elbow,
        leftHip:       leftLeg.hip,
        rightHip:      rightLeg.hip,
        leftKnee:      leftLeg.knee,
        rightKnee:     rightLeg.knee,
        leftAnkle:     leftLeg.ankle,
        rightAnkle:    rightLeg.ankle,
    };

    player.character = {
        isWalking: false,
        inBallForm: false,
        isJumping: false,
        isFalling: false,
    }

    return player;
}


// ============================================================
//  Animations
// ============================================================

function applyIdleAnimation(character, swing) {
    const b = character.bones;
    b.neck.entity.rotation.set(0, 0, 0);
    b.torso.entity.rotation.set(0, 0, 0);
    b.leftShoulder.entity.rotation.set(0, 0, swing * 1.5 - 0.07);
    b.rightShoulder.entity.rotation.set(0, 0, -swing * 1.5 + 0.07);
    b.leftElbow.entity.rotation.set(0, 0, 0);
    b.rightElbow.entity.rotation.set(0, 0, 0);
    b.leftHip.entity.rotation.set(0, 0, 0);
    b.leftKnee.entity.rotation.set(0, 0, 0);
    b.leftAnkle.entity.rotation.set(0, 0, 0);
    b.rightHip.entity.rotation.set(0, 0, 0);
    b.rightKnee.entity.rotation.set(0, 0, 0);
    b.rightAnkle.entity.rotation.set(0, 0, 0);
}

function applyWalkAnimation(character, swing, swing2) {
    const b = character.bones;
    b.leftShoulder.entity.rotation.set(0, 0, -0.5);
    b.rightShoulder.entity.rotation.set(0, 0, 0.5);
    b.torso.entity.rotation.set(0, 0, 0);
    
    b.neck.entity.rotation.set(0, Math.sin(swing) * 0.1, 0);
    b.leftShoulder.entity.rotation.x  =  swing;
    b.rightShoulder.entity.rotation.x = -swing;
    b.leftElbow.entity.rotation.x     =  swing - 1;
    b.rightElbow.entity.rotation.x    = -swing - 1;
    b.leftHip.entity.rotation.x       = -swing * 2;
    b.leftKnee.entity.rotation.x      = (-swing2 * 2.5) + 1.4;
    b.leftAnkle.entity.rotation.x     = -swing;
    b.rightHip.entity.rotation.x      =  swing * 2;
    b.rightKnee.entity.rotation.x     =  (swing2 * 2.5) + 1.4;
    b.rightAnkle.entity.rotation.x    =  swing;
}

function applyRunAnimation(character, swing, swing2) {
    const b = character.bones;

    // Lean the whole torso forward — Sonic's signature aggressive forward tilt
    b.torso.entity.rotation.set(0.5, 0, 0);

    // Shoulders pulled back and inward (arms swept behind the body)
    b.leftShoulder.entity.rotation.set(0.6, 0, -0.8);
    b.rightShoulder.entity.rotation.set(0.6, 0, 0.8);

    // Head stays relatively level despite torso lean
    b.neck.entity.rotation.set(Math.sin(swing) * 0.04 - 0.4, 0, 0);

    // Elbows bent and tucked
    b.leftElbow.entity.rotation.set(0, 0, 0);
    b.rightElbow.entity.rotation.set(0, 0, 0);

    // Legs: much higher amplitude for that fast wheel-like cycling motion
    b.leftHip.entity.rotation.x       = -swing * 2.5 - 0.7;
    b.leftKnee.entity.rotation.x      = (-swing2 * 2.5) + 1.4;
    b.leftAnkle.entity.rotation.x     = -swing;
    b.rightHip.entity.rotation.x      =  swing * 2.5 - 0.7;
    b.rightKnee.entity.rotation.x     =  (swing2 * 2.5) + 1.4;
    b.rightAnkle.entity.rotation.x    =  swing;

}

function applyBallAnimation(character, speed) {
    const b = character.bones;
    b.neck.entity.rotation.set(0.4, 0, 0);
    b.leftShoulder.entity.rotation.set(-1, 0.5, 0);
    b.rightShoulder.entity.rotation.set(-1.3, -0.5, 0);
    b.leftElbow.entity.rotation.set(-0.5, 0, 0);
    b.rightElbow.entity.rotation.set(-0.5, 0, 0);
    b.leftHip.entity.rotation.set(-2, 0, 0);
    b.leftKnee.entity.rotation.set(2.5, 0, 0);
    b.leftAnkle.entity.rotation.set(0, 0, 0);
    b.rightHip.entity.rotation.set(-2, 0, 0);
    b.rightKnee.entity.rotation.set(2.5, 0, 0);
    b.rightAnkle.entity.rotation.set(0, 0, 0);

    // Spin Sonic in ball form based on walk phase
    b.torso.entity.rotation.x += (speed * 0.05) + 0.2;
}

function blink(character, dt) {
    const b = character?.bones;
    if (!b?.eyelids?.entity) return;

    const eyelids = b.eyelids.entity;
    const eyes = b.eyes?.entity;
    if (!character.character) character.character = {};

    const rand = (min, max) => min + Math.random() * (max - min);
    const lerp = (a, c, t) => a + (c - a) * t;
    const smooth = (t) => t * t * (3 - 2 * t);

    if (!character.character._blink) {
        const closedScaleY = eyelids.scale.y;
        const closedPosY = eyelids.position.y;

        const openScaleY = Math.max(0.01, closedScaleY * 0.08);

        let openPosY = closedPosY + closedScaleY * 0.6;
        if (eyes) {
            const eyesTopY = eyes.position.y + (eyes.scale.y * 0.5);
            openPosY = eyesTopY + (openScaleY * 0.5) + 0.01;
        }

        character.character._blink = {
            phase: "opening", // eyelids are built closed by default
            t: 0,
            nextBlinkIn: rand(2.0, 6.0),
            open: { scaleY: openScaleY, posY: openPosY },
            closed: { scaleY: closedScaleY, posY: closedPosY },
            durations: { open: 0.09, close: 0.06, closedHold: 0.04 },
        };
    }

    const s = character.character._blink;
    const safeDt = Math.min(Math.max(dt ?? 0, 0), 0.05);

    const apply = (scaleY, posY) => {
        eyelids.scale.y = scaleY;
        eyelids.position.y = posY;
    };

    if (s.phase === "opening") {
        s.t += safeDt;
        const a = Math.min(s.t / s.durations.open, 1);
        const e = smooth(a);
        apply(
            lerp(s.closed.scaleY, s.open.scaleY, e),
            lerp(s.closed.posY, s.open.posY-0.43, e)
        );
        if (a >= 1) {
            s.phase = "open";
            s.t = 0;
            s.nextBlinkIn = rand(0.1, 10);
        }
        return;
    }

    if (s.phase === "open") {
        s.t += safeDt;
        apply(s.open.scaleY, s.open.posY-0.4);
        if (s.t >= s.nextBlinkIn) {
            s.phase = "closing";
            s.t = 0;
        }
        return;
    }

    if (s.phase === "closing") {
        s.t += safeDt;
        const a = Math.min(s.t / s.durations.close, 1);
        const e = smooth(a);
        apply(
            lerp(s.open.scaleY, s.closed.scaleY, e),
            lerp(s.open.posY-0.43, s.closed.posY, e)
        );
        if (a >= 1) {
            s.phase = "closed";
            s.t = 0;
        }
        return;
    }

    if (s.phase === "closed") {
        s.t += safeDt;
        apply(s.closed.scaleY, s.closed.posY);
        if (s.t >= s.durations.closedHold) {
            s.phase = "opening";
            s.t = 0;
        }
        return;
    }
}



// ============================================================
//  Ground Creation
// ============================================================
function createGround({
    px = 0,
    py = -1,
    pz = 0,
    rx = 0,
    ry = 0,
    rz = 0,
    sx = 10,
    sy = 1,
    sz = 10,
    color = 0x228822,
} = {}) {
    // Create the box
    const ground = entityManager.addBox();

    // Apply it's visual properties
    ground.setScale({ x: sx, y: sy, z: sz });
    ground.entity.position.set(px, py, pz);
    ground.entity.rotation.set(rx, ry, rz);

    let mat = (color) => new THREE.MeshStandardMaterial({ color });
    ground.applyMaterial(mat(color));

    // Add it to the physics world as a static body
    physics.addBody(ground, { type: "static", shape: "box" });

    console.log("Created ground entity:", ground);
    return ground;
}

createGround({ py: -0.5, sz: 20, color: 0x228822 }); // main ground plane
createGround({sx: 500, sz: 500, py: -2, color: 0x888888 }); // back wall

createGround({ px: -10, py: 6, sy: 10, color: 0x228822 }); // left wall
createGround({ px:  10, py: 6, sy: 10, color: 0x228822 }); // right wall


// ============================================================
// Global Variables
// ============================================================

const KEYS = {}; // Keep track of which keys are currently held down
let PRESSED = {}; // Keep track of which keys were just pressed (resets every frame)


// ============================================================
//  Scene Population
// ============================================================


const sonic = createSonicCharacter(SONIC);
sonic.entity.position.set(0, 5, 0);
sonic.entity.rotation.y = Math.PI; // Start facing forward (towards the camera)
physics.addBody(sonic, { type: "dynamic", shape: "box", mass: 1});

const camera = new Camera(null, sonic.entity);
cobble.addPlugin(camera);
camera.position.set(0, 0.6986234459937166, 3.32806580531461);
camera.rotation.set(-0.04834938665190285, 0, 0);
camera.mode = "Orbit";
camera.offset.x = 8; // 6.2 for the Title Screen
camera.offset.y = 5;  // 0.3 for the Title Screen
camera.orbitAngle = Math.PI; // 0 for the Title Screen, PI for going behind Sonic in gameplay



// physics.debug = true;


addEventListener("keydown", (e) => {
    KEYS[e.key.toLowerCase()] = true;
    PRESSED[e.key.toLowerCase()] = true;
});
addEventListener("keyup", (e) => {
    KEYS[e.key.toLowerCase()] = false;
});

let walkPhase = 0;
let lastFrameTime = performance.now() / 1000;

// ── Constants ───────────────────────────────────────────────
const TOP_SPEED     = 18;   // max horizontal speed (units/s)
const ACCEL_FORCE   = 0.18; // base impulse per frame while accelerating
const TURN_PENALTY  = 0.5;  // extra brake impulse when pressing against current velocity
const BRAKE_FACTOR  = 0.18; // deceleration multiplier when no key held
const STOP_THRESH   = 0.1; // speed below which we hard-stop
const ROT_LERP      = 0.2; // how fast Sonic rotates to face his velocity (0–1)
// ────────────────────────────────────────────────────────────

cobble.nextFrame = () => {
    const now = performance.now() / 1000;
    const dt = Math.min(Math.max(now - lastFrameTime, 0), 0.05);
    lastFrameTime = now;

    const vel    = sonic.physics?.state?.velocity ?? new THREE.Vector3();
    const hSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    const grounded = sonic.physics?.state?.isGrounded;

    // ── Land from jump ──────────────────────────────────────
    if (sonic.character.jumping && grounded) {
        sonic.character.jumping = false;
    }

    // ── Jump ────────────────────────────────────────────────
    if (PRESSED[" "] && grounded) {
        physics.applyImpulse(sonic, new THREE.Vector3(0, 15, 0));
        sonic.character.jumping = true;
    }

    // ── Camera-relative input direction (same as before) ────────
    const camYaw     = camera.orbitAngle ?? Math.PI;
    const camForward = new THREE.Vector3(Math.sin(camYaw), 0,  Math.cos(camYaw));
    const camRight   = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));

    const inputDir = new THREE.Vector3();
    if (KEYS["w"]) inputDir.addScaledVector(camForward, -1);
    if (KEYS["s"]) inputDir.addScaledVector(camForward,  1);
    if (KEYS["a"]) inputDir.addScaledVector(camRight,   -1);
    if (KEYS["d"]) inputDir.addScaledVector(camRight,    1);

    if (KEYS["q"]) camera.orbitAngle += 0.05;
    if (KEYS["e"]) camera.orbitAngle -= 0.05;

    const hasInput   = inputDir.lengthSq() > 0;
    if (hasInput) inputDir.normalize();

    // ── Unified speed + direction steering ──────────────────────
    const hVel        = new THREE.Vector3(vel.x, 0, vel.z);
    let   speed       = hVel.length();                         // scalar, always >= 0
    const currentDir  = speed > 0.01
        ? hVel.clone().divideScalar(speed)                     // normalised movement direction
        : (hasInput ? inputDir.clone() : camForward.clone());  // fallback when nearly stopped

    if (hasInput) {
        // 1. Accelerate — scale force down near top speed
        const accel = ACCEL_FORCE * (1 - Math.min(speed / TOP_SPEED, 1) * 0.6);
        speed = Math.min(speed + accel, TOP_SPEED);

        // 2. Steer — rotate current direction toward input direction each frame.
        //    turnRate increases with speed so fast movement steers sharply.
        const turnRate = 0.18 + (speed / TOP_SPEED) * 0.18;
        const newDir   = currentDir.clone().lerp(inputDir, turnRate).normalize();

        physics.setVelocity(sonic, new THREE.Vector3(
            newDir.x * speed,
            vel.y,
            newDir.z * speed
        ));
    } else if (grounded) {
        // 3. Decelerate smoothly when no input, preserve direction
        speed = Math.max(speed - ACCEL_FORCE * 1.5, 0);
        physics.setVelocity(sonic, new THREE.Vector3(
            currentDir.x * speed,
            vel.y,
            currentDir.z * speed
        ));
    }

    // ── Hard speed cap (safety net) ─────────────────────────────
    const newHSpeed = Math.sqrt(
        sonic.physics.state.velocity.x ** 2 + sonic.physics.state.velocity.z ** 2
    );
    if (newHSpeed > TOP_SPEED) {
        const s = TOP_SPEED / newHSpeed;
        const v = sonic.physics.state.velocity;
        physics.setVelocity(sonic, new THREE.Vector3(v.x * s, v.y, v.z * s));
    }

    // ── Smooth rotation toward velocity direction ────────────
    if (hSpeed > 0.1) {
        const targetAngle = Math.atan2(vel.x, vel.z);
        // Shortest-path lerp on the angle
        let delta = targetAngle - sonic.entity.rotation.y;
        // Wrap delta to [-PI, PI]
        while (delta >  Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        sonic.entity.rotation.y += delta * ROT_LERP;
    }

    // ── Walk phase & animations ──────────────────────────────
    walkPhase += dt * hSpeed * 1.5;
    let breathing = Math.sin((cobble.frame / 120) * 8) * 0.05; // subtle up/down motion to make idle pose less static

    if (sonic.character.jumping) {
        applyBallAnimation(sonic, Math.min(hSpeed, 15));
    } else if (hSpeed > 15) {
        applyRunAnimation(sonic, -Math.sin(walkPhase) * 0.5, Math.cos(walkPhase) * 0.5);
    } else if (hSpeed > 0.05) {
        applyWalkAnimation(sonic, -Math.sin(walkPhase) * 0.5, Math.cos(walkPhase) * 0.5);
    } else {
        applyIdleAnimation(sonic, breathing);
    }

    blink(sonic, dt);

    PRESSED = {};
};


console.log(cobble);