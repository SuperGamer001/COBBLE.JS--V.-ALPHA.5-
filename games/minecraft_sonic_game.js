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
physics.defaults.restitution = 0;
physics.defaults.friction = -0.01;


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
        eyes:    { scale: { x: 0.51, y: 0.25, z: 0.1  }, position: { x: 0,    y:  0.01, z: 0.08  } },
        brows:   { scale: { x: 0.1,  y: 0.2,  z: 0.1  }, position: { x: 0,    y:  0.1,  z: 0.084 }, rx: -0.1 },
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

    return player;
}


// ============================================================
//  Animations
// ============================================================

function applyWalkAnimation(character, swing, swing2) {
    const b = character.bones;
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


// ============================================================
//  Scene Population
// ============================================================


const sonic = createSonicCharacter(SONIC);
sonic.entity.position.set(0, 1, -20);

const camera = new Camera(null, null);
cobble.addPlugin(camera);
camera.position.set(0, 0.6986234459937166, 3.32806580531461);
camera.rotation.set(-0.04834938665190285, 0, 0);
camera.mode = "Orbit";
camera.offset.x = 6.2;
camera.offset.y = 0.3;
camera.orbitAngle = 0; ///////////////////////////////////////////////////////////////////////////////

// This sphere ignores global gravity, floats slowly
physics.addBody(sonic, { type: "dynamic", shape: "box", mass: 1});

// A slope — just a rotated static box

// ============================================================
//  Ground
// ============================================================

const ground = entityManager.addBox();
ground._visual.scale.set(5, 500, 500);
ground.entity.position.y = -250.5;
ground._visual.material.roughness = 1;
ground.applyTexture("./COBBLE/assets/minecraft/blocks/chiseled_stone_bricks.png", 5, 500);
ground.applyLightmap("./COBBLE/assets/minecraft/blocks/chiseled_stone_bricks.png", 5, 500);
physics.addBody(ground, { type: "static", shape: "box" });


// physics.debug = true;





let walkPhase = 0;

setInterval(() => {
    const vel = sonic.physics?.state?.velocity ?? new THREE.Vector3();
    const hSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z); // horizontal only, ignore y

    // Advance the animation phase proportional to horizontal speed.
    // When hSpeed is 0 the phase freezes and the legs stop mid-stride.
    walkPhase += (16 / 1000) * hSpeed * 2.5;

    if (hSpeed > 0.05) {
        applyWalkAnimation(sonic, -Math.sin(walkPhase) * 0.5, Math.cos(walkPhase) * 0.5);
    } else {
        applyWalkAnimation(sonic, 0, 0); // return to idle pose
    }

    physics.applyImpulse(sonic, new THREE.Vector3(0, 0, 0.1));

    if (cobble.frame >= 180) {
        camera.target = sonic.entity;
    }
    if (cobble.frame >= 270 && camera.orbitAngle >= -1) {
        camera.orbitAngle -= 0.01;
    }
}, 16);


console.log(cobble);