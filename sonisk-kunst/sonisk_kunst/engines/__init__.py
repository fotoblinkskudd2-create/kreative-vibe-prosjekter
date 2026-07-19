from .mandala import render_mandala
from .flowfield import render_flowfield
from .particles import render_particles

ENGINES = {
    "mandala": render_mandala,
    "flowfield": render_flowfield,
    "particles": render_particles,
}

__all__ = ["ENGINES", "render_mandala", "render_flowfield", "render_particles"]
