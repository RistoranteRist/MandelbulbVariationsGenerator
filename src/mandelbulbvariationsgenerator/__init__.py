import click
from pathlib import Path

# from .default import render as default_render
# from .mandelbulb import render as mandelbulb_render
# from .mandelbulb_multiview import render as mandelbulb_multiview_render
# from .mandelbulb_512_color import render as mandelbulb_512_color_render
from .MandelbulbVariations import render as MandelbulbVariations_render

# from .mandelbulb_512_gray_aa import render as mandelbulb_512_gray_aa_render
# from .mandelbulb_8192_color_aa import render as mandelbulb_8192_color_aa_render
# from .mandelbulb_512a_color_aa import render as mandelbulb_512a_color_aa_render
from .HybridMandelbulbVariations import (
    render as HybridMandelbulbVariations_render,
)
from .HybridMandelbulbVariationsIllustration import (
    render as HybridMandelbulbVariationsIllustration_render,
)
# from .mandelbulb_1568_color_aa import render as mandelbulb_1568_color_aa_render


@click.group()
def main():
    pass


def process_int_list(ctx, param, value: list):
    try:
        return [int(v) for v in value.split(",")]
    except ValueError:
        raise click.BadParameter("List must only contain integers")


@main.command()
@click.option("--out", type=Path, default=Path("./out"))
@click.option("--width", type=int, default=512)
@click.option("--height", type=int, default=512)
@click.option("--n_per_class", type=int, default=2)
@click.option("--power_min", type=int, default=8)
@click.option("--power_max", type=int, default=8)
@click.option(
    "--rules",
    default="",
    callback=process_int_list,
    help="Comma-separated list of integers",
)
def MandelbulbVariations(
    out: Path,
    width: int,
    height: int,
    n_per_class: int,
    power_min: int,
    power_max: int,
    rules: list,
):
    MandelbulbVariations_render(
        out, width, height, n_per_class, power_min, power_max, rules
    )


@main.command()
@click.option("--out", type=Path, default=Path("./out"))
@click.option("--width", type=int, default=512)
@click.option("--height", type=int, default=512)
@click.option("--n_per_class", type=int, default=2)
def HybridMandelbulbVariations(out: Path, width: int, height: int, n_per_class: int):
    HybridMandelbulbVariations_render(out, width, height, n_per_class)


@main.command()
@click.option("--out", type=Path, default=Path("./out"))
@click.option("--width", type=int, default=512)
@click.option("--height", type=int, default=512)
def HybridMandelbulbVariationsIllustration(
    out: Path, width: int, height: int
):
    HybridMandelbulbVariationsIllustration_render(out, width, height)


if __name__ == "__main__":
    main()
