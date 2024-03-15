#version 330
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float powerA;
uniform int ruleA;
uniform float powerB;
uniform int ruleB;
uniform float lng;
uniform float lat;
uniform vec3 col1;
uniform vec3 col2;
uniform vec3 col3;
const float PI = 3.14159265359;
float mandelbulbSDF(vec3 pos, out vec3 orbit_trap){
    float sign_x;
    float sign_y;
    float sign_z;
    float angle_x;
    float angle_y;
    float angle_z;
    float pos_x;
    float pos_y;
    float pos_z;

    // The following rule* definitions are different order from $b_i$ in our paper.
    // But, this boils down to essentially the same pre-training dataset.
    bool ruleA1 = bool(int(mod(float(ruleA), 512.0)) / 256);
    bool ruleA2 = bool(int(mod(float(ruleA), 256.0)) / 128);
    bool ruleA3 = bool(int(mod(float(ruleA), 128.0)) / 64);
    bool ruleA4 = bool(int(mod(float(ruleA), 64.0)) / 32);
    bool ruleA5 = bool(int(mod(float(ruleA), 32.0)) / 16);
    bool ruleA6 = bool(int(mod(float(ruleA), 16.0)) / 8);
    bool ruleA7 = bool(int(mod(float(ruleA), 8.0)) / 4);
    bool ruleA8 = bool(int(mod(float(ruleA), 4.0)) / 2);
    bool ruleA9 = bool(mod(float(ruleA), 2.0));

    bool ruleB1 = bool(int(mod(float(ruleB), 512.0)) / 256);
    bool ruleB2 = bool(int(mod(float(ruleB), 256.0)) / 128);
    bool ruleB3 = bool(int(mod(float(ruleB), 128.0)) / 64);
    bool ruleB4 = bool(int(mod(float(ruleB), 64.0)) / 32);
    bool ruleB5 = bool(int(mod(float(ruleB), 32.0)) / 16);
    bool ruleB6 = bool(int(mod(float(ruleB), 16.0)) / 8);
    bool ruleB7 = bool(int(mod(float(ruleB), 8.0)) / 4);
    bool ruleB8 = bool(int(mod(float(ruleB), 4.0)) / 2);
    bool ruleB9 = bool(mod(float(ruleB), 2.0));

    float theta;
    float phi;
    float zr;

    vec3 z=pos;
    float dr=1.;
    float r=0.;
    orbit_trap = vec3(1e20);
    for(int i = 0; i < 100; i++){
        // Rule A
        r = length(z);
        if(r>4.)break;
        // convert to polar coordinates
        theta = acos(z.z/r);
        phi = atan(z.y,z.x);
        dr = pow(r,powerA)*powerA*dr+1.;

        // scale and rotate the point
        zr = pow(r,powerA);
        theta = theta*powerA;
        phi = phi*powerA;
        if (ruleA3 == false){sign_x = 1.0;} else {sign_x = -1.0;}
        if (ruleA6 == false){sign_y = 1.0;} else {sign_y = -1.0;}
        if (ruleA9 == false){sign_z = 1.0;} else {sign_z = -1.0;}

        if (ruleA2 == false){angle_x = phi;} else {angle_x = theta;}
        if (ruleA5 == false){angle_y = phi;} else {angle_y = theta;}
        if (ruleA8 == false){angle_z = phi;} else {angle_z = theta;}

        if (ruleA1 == false){pos_x = sign_x * cos(angle_x);} else {pos_x = sign_x * sin(angle_x);}
        if (ruleA4 == false){pos_y = sign_y * cos(angle_y);} else {pos_y = sign_y * sin(angle_y);}
        if (ruleA7 == false){pos_z = sign_z * cos(angle_z);} else {pos_z = sign_z * sin(angle_z);}

        // convert back to cartesian coordinates
        z=zr*vec3(pos_x, pos_y, pos_z);
        z+=pos;
        orbit_trap.x = min(pow(abs(z.z),0.1), orbit_trap.x);
        orbit_trap.y = min((abs(z.x)+abs(z.y)+abs(z.z))/1.5, orbit_trap.y);
        orbit_trap.z = min(length(z), orbit_trap.z);


        // Rule B
        r = length(z);
        if(r>4.)break;
        // convert to polar coordinates
        theta = acos(z.z/r);
        phi = atan(z.y,z.x);
        dr = pow(r,powerB)*powerB*dr+1.;

        // scale and rotate the point
        zr = pow(r,powerB);
        theta = theta*powerB;
        phi = phi*powerB;
        if (ruleB3 == false){sign_x = 1.0;} else {sign_x = -1.0;}
        if (ruleB6 == false){sign_y = 1.0;} else {sign_y = -1.0;}
        if (ruleB9 == false){sign_z = 1.0;} else {sign_z = -1.0;}

        if (ruleB2 == false){angle_x = phi;} else {angle_x = theta;}
        if (ruleB5 == false){angle_y = phi;} else {angle_y = theta;}
        if (ruleB8 == false){angle_z = phi;} else {angle_z = theta;}

        if (ruleB1 == false){pos_x = sign_x * cos(angle_x);} else {pos_x = sign_x * sin(angle_x);}
        if (ruleB4 == false){pos_y = sign_y * cos(angle_y);} else {pos_y = sign_y * sin(angle_y);}
        if (ruleB7 == false){pos_z = sign_z * cos(angle_z);} else {pos_z = sign_z * sin(angle_z);}

        // convert back to cartesian coordinates
        z=zr*vec3(pos_x, pos_y, pos_z);
        z+=pos;
        orbit_trap.x = min(pow(abs(z.z),0.1), orbit_trap.x);
        orbit_trap.y = min((abs(z.x)+abs(z.y)+abs(z.z))/1.5, orbit_trap.y);
        orbit_trap.z = min(length(z), orbit_trap.z);
    }
    return .5*log(r)*r/dr;
}
vec3 gradSDF(vec3 p){
    float eps = 0.001;
    vec3 trash;
    return normalize(vec3(
        mandelbulbSDF(p + vec3(eps, 0.0, 0.0), trash) - mandelbulbSDF(p - vec3(eps, 0.0, 0.0), trash),
        mandelbulbSDF(p + vec3(0.0, eps, 0.0), trash) - mandelbulbSDF(p - vec3(0.0, eps, 0.0), trash),
        mandelbulbSDF(p + vec3(0.0, 0.0, eps), trash) - mandelbulbSDF(p - vec3(0.0, 0.0, eps), trash)
    ));
}
//begin rot
vec2 rot2(vec2 p, float t){
    return vec2(cos(t) * p.x -sin(t) * p.y, sin(t) * p.x + cos(t) * p.y);
}
vec3 rotX(vec3 p, float t){
    return vec3(p.x, rot2(p.yz, t));
}
vec3 rotY(vec3 p, float t){
    return vec3(p.y, rot2(p.zx, t)).zxy;
}
vec3 rotZ(vec3 p, float t){
    return vec3(rot2(p.xy, t), p.z);
}
//end rot

float raymarch(vec3 p0, vec3 ray, int max_step, float th, out vec3 orbit_trap){
    float L=0.0;
    vec3 p;
    for (int i = 0; i < max_step; i ++ ){
        p = p0+L*ray;
        if (mandelbulbSDF(p, orbit_trap) > th){
            L += mandelbulbSDF(p, orbit_trap);
        } else {
            return L;
        }
    }
    return L;
}

void main(){
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y) / 2.0;
    vec3 lookAt = vec3(0.0, 0.0, 0.0);
    vec3 cDir = rotZ(rotX(vec3(0.0, -1.0, 0.0), lat), lng);
    vec3 cUp = rotZ(rotX(vec3(0.0, 0.0, 1.0), lat), lng);
    vec3 cSide = cross(cDir, cUp);
    vec3 cPos = lookAt - 2.5 * cDir;

    float targetDepth = 1.0;
    vec3 lPos = vec3(-10.0, 10.0, 10.0);

    vec3 ray = cSide * p.x + cUp * p.y + cDir * targetDepth;
    vec3 rPos = cPos;
    float L;
    float LL;
    vec3 trap;
    vec3 trash;
    ray = normalize(ray);

    fragColor.rgb = vec3(1.0);
    L = raymarch(cPos, ray, 1000, 0.001, trap);
    rPos = cPos + ray*L;
    float r = length(rPos);
    if (L < 10.0) {
        ray = normalize(lPos-rPos);
        // vec3 base_col1 = vec3(1.,0.,0.);
        // vec3 base_col2 = vec3(0.,1.,0.);
        // vec3 base_col3 = vec3(0.,0.,1.);
        vec3 base_col1 = col1;
        vec3 base_col2 = col2;
        vec3 base_col3 = col3;
        float amb = 0.3;
        float diff = 0.9 * max(dot(ray, -gradSDF(rPos)), 0.0);
        vec3 col;
        col = base_col1 * clamp(pow(trap.x,10.0),0.0,1.0);
        col += base_col2 * clamp(pow(trap.y,10.0),0.0,1.0);
        col += base_col3 * clamp(pow(trap.z,10.0),0.0,1.0);
        // col = vec3(1.5, 0.5, 0.5);
        col *= diff + amb;
        col *= r*r;
        LL = raymarch(rPos+gradSDF(rPos)/100000.0, ray, 10000, 0.0001, trash);
        if (LL < 10000.0) {
        } else {
            // float diff = 1.2 * max(dot(ray, gradSDF(rPos)), 0.0);
            col += vec3(0.2,0.2,0.2);
        }
        fragColor.rgb = col;
    } else {
        fragColor.rgb = vec3(1.0);
    }
    fragColor.a = 1.0;
}
