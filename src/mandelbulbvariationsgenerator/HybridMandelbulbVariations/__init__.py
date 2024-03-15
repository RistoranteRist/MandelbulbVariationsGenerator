from pathlib import Path
import moderngl
import numpy as np
from PIL import Image
import time

RNG = np.random.default_rng(42)
AA = 2

def render(out: Path, width: int, height: int, n_per_class: int):
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
    with open(Path(__file__).parent / "mandelbulb_512a_512a_color.frag") as f:
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

    with open(Path(__file__).parent / "names_class.txt") as f:
        names_class = f.read().split("\n")

    for name_class in names_class:
        hoge = name_class.split("_")
        if len(hoge) == 1:
            powerA = int(hoge[0].split("-")[0][5:])
            ruleA = int(hoge[0].split("-")[1][4:])
            powerB = int(hoge[0].split("-")[0][5:])
            ruleB = int(hoge[0].split("-")[1][4:])
        elif len(hoge) == 2:
            powerA = int(hoge[0].split("-")[0][5:])
            ruleA = int(hoge[0].split("-")[1][4:])
            powerB = int(hoge[1].split("-")[0][5:])
            ruleB = int(hoge[1].split("-")[1][4:])
        prog["powerA"].value = powerA
        prog["ruleA"].value = ruleA
        prog["powerB"].value = powerB
        prog["ruleB"].value = ruleB
        dir_category = out / name_class
        dir_category.mkdir(exist_ok=True, parents=True)

        for i in range(n_per_class):
            prog["lat"].value = -30 + 60 * RNG.random()
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
