<script lang="ts">
    import { onMount } from 'svelte';
    import type { TypstComponentProps } from '$tyquire/svelte/types';

    let { props }: TypstComponentProps = $props();
    let canvas: HTMLCanvasElement;
    let frame = 0;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let themeObserver: MutationObserver | undefined;

    const NODE_COUNT = $derived.by(() => props.size as number);
    const SOURCE = 0;
    const FRAME_MS = 150;
    /** Layout space is ASPECT wide and 1 tall, roughly the canvas's drawable area. */
    const ASPECT = 2;

    interface Point {
        x: number;
        y: number;
    }

    interface Edge {
        from: number;
        to: number;
        weight: number;
    }

    interface Frame {
        /** Node being selected (select frame) or -1 */
        current: number;
        distances: number[];
        settled: boolean[];
        prev: number[];
        /** Neighbors whose distance improved in this frame's relaxation */
        relaxed: number[];
        /** Shortest path revealed so far (path frames only) */
        route: number[];
        /** Node whose edges are being relaxed (relax frame) or -1 */
        relaxing: number;
    }

    function hash(seed: number): number {
        let value = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
        value ^= value >>> 13;
        value = Math.imul(value, 0xc2b2ae35);
        return ((value ^ (value >>> 16)) >>> 0) / 0xffffffff;
    }

    function distance(a: Point, b: Point): number {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function createNodePositions(): Point[] {
        let seed = 1;
        const random = () => hash(seed++);
        const sample = (): Point => ({ x: random() * ASPECT, y: random() });

        // Best-candidate sampling: for each new node, try several random spots
        // and keep the one farthest from every node placed so far.
        const points: Point[] = [sample()];
        while (points.length < NODE_COUNT) {
            let best = sample();
            let bestGap = -1;
            for (let attempt = 0; attempt < 40; attempt++) {
                const candidate = sample();
                const gap = Math.min(...points.map((point) => distance(point, candidate)));
                if (gap > bestGap) {
                    best = candidate;
                    bestGap = gap;
                }
            }
            points.push(best);
        }

        // Relaxation: push apart any pair closer than the target spacing.
        const spacing = 0.34;
        for (let iteration = 0; iteration < 120; iteration++) {
            for (let first = 0; first < points.length; first++) {
                for (let second = first + 1; second < points.length; second++) {
                    const deltaX = points[first].x - points[second].x;
                    const deltaY = points[first].y - points[second].y;
                    const length = Math.hypot(deltaX, deltaY) || 0.001;
                    if (length >= spacing) continue;

                    const push = (spacing - length) * 0.25;
                    const offsetX = (deltaX / length) * push;
                    const offsetY = (deltaY / length) * push;
                    points[first].x += offsetX;
                    points[first].y += offsetY;
                    points[second].x -= offsetX;
                    points[second].y -= offsetY;
                }
            }

            for (const point of points) {
                point.x = Math.min(ASPECT, Math.max(0, point.x));
                point.y = Math.min(1, Math.max(0, point.y));
            }
        }

        return points;
    }

    function createEdges(points: Point[]): Edge[] {
        const edgeKeys = new Set<string>();
        const edges: Edge[] = [];
        const addEdge = (from: number, to: number) => {
            const key = from < to ? `${from}-${to}` : `${to}-${from}`;
            if (edgeKeys.has(key)) return;
            edgeKeys.add(key);
            edges.push({
                from,
                to,
                weight: Math.max(1, Math.round(distance(points[from], points[to]) * 10))
            });
        };

        for (let index = 1; index < points.length; index++) {
            let nearest = 0;
            for (let candidate = 1; candidate < index; candidate++) {
                if (
                    distance(points[index], points[candidate]) <
                    distance(points[index], points[nearest])
                ) {
                    nearest = candidate;
                }
            }
            addEdge(index, nearest);
        }

        for (let index = 0; index < points.length; index++) {
            const nearest = points
                .map((point, candidate) => ({
                    candidate,
                    gap: candidate === index ? Infinity : distance(points[index], point)
                }))
                .sort((a, b) => a.gap - b.gap)[0];
            addEdge(index, nearest.candidate);
        }

        return edges;
    }

    /**
     * Frame 0 is a clean idle state. Each Dijkstra step then produces two frames:
     * "select" (pick the closest unsettled node) and "relax" (update its neighbors).
     * Finally the shortest path to the farthest node is revealed one node at a time.
     */
    function createFrames(edges: Edge[]): Frame[] {
        const adjacency = Array.from(
            { length: NODE_COUNT },
            () => [] as { node: number; weight: number }[]
        );
        for (const edge of edges) {
            adjacency[edge.from].push({ node: edge.to, weight: edge.weight });
            adjacency[edge.to].push({ node: edge.from, weight: edge.weight });
        }

        const distances = Array.from({ length: NODE_COUNT }, () => Infinity);
        const prev = Array.from({ length: NODE_COUNT }, () => -1);
        const settled = Array.from({ length: NODE_COUNT }, () => false);
        distances[SOURCE] = 0;

        const snapshot = (
            current: number,
            relaxing: number,
            relaxed: number[],
            route: number[]
        ): Frame => ({
            current,
            relaxing,
            relaxed,
            route,
            distances: [...distances],
            settled: [...settled],
            prev: [...prev]
        });

        const frames: Frame[] = [snapshot(-1, -1, [], [])];

        for (let iteration = 0; iteration < NODE_COUNT; iteration++) {
            let current = -1;
            for (let node = 0; node < NODE_COUNT; node++) {
                if (settled[node] || !Number.isFinite(distances[node])) continue;
                if (current < 0 || distances[node] < distances[current]) current = node;
            }
            if (current < 0) break;

            frames.push(snapshot(current, -1, [], []));

            settled[current] = true;
            const relaxed: number[] = [];
            for (const neighbor of adjacency[current]) {
                if (settled[neighbor.node]) continue;
                const candidate = distances[current] + neighbor.weight;
                if (candidate < distances[neighbor.node]) {
                    distances[neighbor.node] = candidate;
                    prev[neighbor.node] = current;
                    relaxed.push(neighbor.node);
                }
            }
            frames.push(snapshot(-1, current, relaxed, []));
        }

        // Reveal the shortest path to the farthest reachable node.
        let target = SOURCE;
        for (let node = 0; node < NODE_COUNT; node++) {
            if (Number.isFinite(distances[node]) && distances[node] > distances[target]) {
                target = node;
            }
        }
        const path: number[] = [];
        for (let node = target; node !== -1; node = prev[node]) path.push(node);
        path.reverse();

        for (let length = 1; length <= path.length; length++) {
            frames.push(snapshot(-1, -1, [], path.slice(0, length)));
        }

        return frames;
    }

    const nodePositions = createNodePositions();
    const edges = createEdges(nodePositions);
    const frames = createFrames(edges);
    const lastFrame = frames.length - 1;

    function draw() {
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width === 0 || height === 0) return;

        const scale = window.devicePixelRatio || 1;
        const pixelWidth = Math.round(width * scale);
        const pixelHeight = Math.round(height * scale);
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
        }

        // Read colors every draw so theme changes are picked up.
        const colors = getComputedStyle(canvas);
        const activeColor = colors.getPropertyValue('--animation-active').trim();
        const borderColor = colors.getPropertyValue('--animation-border').trim();
        const edgeColor = colors.getPropertyValue('--animation-edge').trim();
        const nodeColor = colors.getPropertyValue('--animation-node').trim();
        const pathColor = colors.getPropertyValue('--animation-path').trim();
        const routeColor = colors.getPropertyValue('--animation-route').trim();
        const backgroundColor = colors.backgroundColor;

        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.clearRect(0, 0, width, height);

        const padding = Math.min(width, height) * 0.12;
        const gridWidth = width - padding * 2;
        const gridHeight = height - padding * 2;
        const points = nodePositions.map(({ x, y }) => ({
            x: padding + (x / ASPECT) * gridWidth,
            y: padding + y * gridHeight
        }));

        // Pick the side of a node (below, above, right, left) with the fewest edges nearby.
        const labelOffset = (index: number) => {
            const candidates = [
                { x: 0, y: 24 },
                { x: 0, y: -24 },
                { x: 26, y: 0 },
                { x: -26, y: 0 }
            ];
            const directions = edges
                .filter((edge) => edge.from === index || edge.to === index)
                .map((edge) => {
                    const other = points[edge.from === index ? edge.to : edge.from];
                    const dx = other.x - points[index].x;
                    const dy = other.y - points[index].y;
                    const length = Math.hypot(dx, dy) || 1;
                    return { x: dx / length, y: dy / length };
                });

            let best = candidates[0];
            let bestScore = Infinity;
            for (const candidate of candidates) {
                const length = Math.hypot(candidate.x, candidate.y);
                // Highest alignment with any edge; lower means more clearance.
                const score = Math.max(
                    -1,
                    ...directions.map((d) => (d.x * candidate.x + d.y * candidate.y) / length)
                );
                if (score < bestScore) {
                    best = candidate;
                    bestScore = score;
                }
            }
            return best;
        };

        const state = frames[Math.min(Math.max(frame, 0), lastFrame)];
        const routeSet = new Set(state.route);
        const relaxedSet = new Set(state.relaxed);

        const strokeEdge = (from: number, to: number, color: string, lineWidth: number) => {
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.beginPath();
            context.moveTo(points[from].x, points[from].y);
            context.lineTo(points[to].x, points[to].y);
            context.stroke();
        };

        const isTreeEdge = (edge: Edge) =>
            (state.prev[edge.to] === edge.from && state.settled[edge.to]) ||
            (state.prev[edge.from] === edge.to && state.settled[edge.from]);

        const isRelaxEdge = (edge: Edge) =>
            state.relaxing >= 0 &&
            ((edge.from === state.relaxing && relaxedSet.has(edge.to)) ||
                (edge.to === state.relaxing && relaxedSet.has(edge.from)));

        // Base edges, then the shortest-path tree, then relaxation, then the final route.
        for (const edge of edges) {
            strokeEdge(edge.from, edge.to, edgeColor, 2);
        }
        for (const edge of edges) {
            if (isTreeEdge(edge)) strokeEdge(edge.from, edge.to, pathColor, 2);
        }
        for (const edge of edges) {
            if (isRelaxEdge(edge)) strokeEdge(edge.from, edge.to, activeColor, 2);
        }
        for (let index = 1; index < state.route.length; index++) {
            strokeEdge(state.route[index - 1], state.route[index], routeColor, 2);
        }

        // Edge weights.
        context.font = '10px ui-monospace, monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        for (const edge of edges) {
            const x = (points[edge.from].x + points[edge.to].x) / 2;
            const y = (points[edge.from].y + points[edge.to].y) / 2;
            const label = String(edge.weight);
            const labelWidth = context.measureText(label).width + 6;
            context.fillStyle = backgroundColor;
            context.fillRect(x - labelWidth / 2, y - 7, labelWidth, 14);
            context.fillStyle = borderColor;
            context.fillText(label, x, y);
        }

        // Nodes and their current distance labels.
        for (const [index, point] of points.entries()) {
            const isSelecting = index === state.current;
            const isRoute = routeSet.has(index);
            const isRelaxed = relaxedSet.has(index);
            const isSettled = state.settled[index];

            context.fillStyle = isRoute
                ? routeColor
                : isSelecting
                  ? activeColor
                  : isSettled
                    ? pathColor
                    : nodeColor;
            context.strokeStyle = isRelaxed ? activeColor : borderColor;
            context.lineWidth = isSelecting || isRelaxed || isRoute ? 3 : 2;
            context.beginPath();
            context.roundRect(point.x - 10, point.y - 10, 20, 20, 3);
            context.fill();
            context.stroke();

            const cost = Number.isFinite(state.distances[index]) ? state.distances[index] : '∞';
            const text = String(cost);
            const offset = labelOffset(index);
            const labelX = point.x + offset.x;
            const labelY = point.y + offset.y;
            const textWidth = context.measureText(text).width + 6;
            context.fillStyle = backgroundColor;
            context.fillRect(labelX - textWidth / 2, labelY - 7, textWidth, 14);
            context.fillStyle = borderColor;
            context.fillText(text, labelX, labelY);
        }
    }

    function stop() {
        cancelAnimationFrame(animationFrame);
    }

    function showFinal() {
        stop();
        frame = lastFrame;
        draw();
    }

    /** Start (or restart) the animation from the idle state. */
    function play() {
        stop();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            showFinal();
            return;
        }

        frame = 0;
        draw();
        const startedAt = performance.now();
        const tick = (now: number) => {
            frame = Math.min(lastFrame, Math.floor((now - startedAt) / FRAME_MS));
            draw();
            if (frame < lastFrame) {
                animationFrame = requestAnimationFrame(tick);
            }
        };
        animationFrame = requestAnimationFrame(tick);
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            play();
        }
    }

    onMount(() => {
        // Always start from a clean idle state, never a half-run one.
        frame = 0;
        draw();

        resizeObserver = new ResizeObserver(draw);
        resizeObserver.observe(canvas);

        // Redraw when the theme flips (including the late attribute set on refresh).
        themeObserver = new MutationObserver(draw);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['color-scheme', 'class', 'data-theme']
        });
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemeQuery.addEventListener('change', draw);

        intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    intersectionObserver?.disconnect();
                    play();
                } else if (entry.boundingClientRect.bottom < 0) {
                    // Restored scroll position is already past the figure: show the result.
                    intersectionObserver?.disconnect();
                    showFinal();
                }
            },
            { threshold: 0.35 }
        );
        intersectionObserver.observe(canvas);

        return () => {
            stop();
            resizeObserver?.disconnect();
            intersectionObserver?.disconnect();
            themeObserver?.disconnect();
            colorSchemeQuery.removeEventListener('change', draw);
        };
    });
</script>

<canvas
    class="animation"
    bind:this={canvas}
    tabindex="0"
    role="button"
    aria-label="Dijkstra's algorithm animation. Click or press Enter to replay."
    onclick={play}
    onkeydown={onKeydown}
>
</canvas>

<style>
    .animation {
        --animation-active: #c2410c;
        --animation-border: #292524;
        --animation-edge: #a8a29e;
        --animation-node: #f5f5f4;
        --animation-path: #0f766e;
        --animation-route: #be123c;
    }

    canvas {
        display: block;
        width: 100%;
        height: min(60vw, 22rem);
        min-height: 14rem;
        background: var(--background);
        cursor: pointer;
    }

    canvas:focus-visible {
        outline: 1px solid var(--animation-active);
        outline-offset: 4px;
    }

    :global(html[color-scheme='dark']) .animation {
        --animation-border: #d6d3d185;
        --animation-edge: #57534e;
        --animation-node: #292524;
    }
</style>
