from pathlib import Path
import moderngl
import numpy as np
from PIL import Image
import time

RNG = np.random.default_rng(42)
AA = 2

def render(out: Path, width: int, height: int, n_per_class: int, power_min: int, power_max: int, rules: list):
    ctx = moderngl.create_context(
        standalone=True,
        backend="egl",
    )
    vertex_shader = """
    #version 330
    in vec2 in_vert;
    void main() {
        gl_Position = vec4(in_vert, 0.0, 1.0);
    }
    """
    with open(Path(__file__).parent / "mandelbulb_512_color.frag") as f:
        fragment_shader = f.read()

    prog = ctx.program(vertex_shader=vertex_shader, fragment_shader=fragment_shader)

    vertices = np.array(
        [
            -1.0,
            -1.0,
            1.0,
            -1.0,
            -1.0,
            1.0,
            1.0,
            1.0,
        ],
        dtype="f4",
    )

    vbo = ctx.buffer(vertices)
    vao = ctx.simple_vertex_array(prog, vbo, "in_vert")
    fbo = ctx.framebuffer(color_attachments=[ctx.texture((width*AA, height*AA), 4)])

    fbo.use()
    ctx.clear()
    prog["u_resolution"].value = (width*AA, height*AA)
    time_init = time.time()
    for p in range(power_min, power_max + 1):
        prog["power"].value = p
        for rule in rules:
            dir_category = out / f"power{p}-rule{rule}"
            dir_category.mkdir(exist_ok=True, parents=True)

            # The following rule* definitions are different order from $b_i$ in our paper.
            # But, this boils down to essentially the same pre-training dataset.
            rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9 = [
                bool(int(s)) for s in bin(rule)[2:].zfill(9)
            ]
            prog["rule1"].value = rule1
            prog["rule2"].value = rule2
            prog["rule3"].value = rule3
            prog["rule4"].value = rule4
            prog["rule5"].value = rule5
            prog["rule6"].value = rule6
            prog["rule7"].value = rule7
            prog["rule8"].value = rule8
            prog["rule9"].value = rule9

            for i in range(n_per_class):
                prog["lat"].value = -90 + 180 * RNG.random()
                prog["lng"].value = 360 * RNG.random()
                prog["col1"].value = (RNG.random(), RNG.random(), RNG.random())
                prog["col2"].value = (RNG.random(), RNG.random(), RNG.random())
                prog["col3"].value = (RNG.random(), RNG.random(), RNG.random())

                vao.render(moderngl.TRIANGLE_STRIP)
                data = fbo.read(components=3)
                image = Image.frombytes("RGB", fbo.size, data)
                image = image.resize((width, height), Image.LANCZOS)
                image = image.transpose(Image.FLIP_TOP_BOTTOM)
                image.save(dir_category / f"{i}.png")

                print("time:", time.time() - time_init)
                i = i + 1
