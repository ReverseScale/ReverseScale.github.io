import {
  createStoryCursor,
  explorationStates,
  interactionMoments,
  planTasks,
  replayMarkers,
  showcaseScenario,
  storyCapabilities,
} from "./mobile-lab-story.mjs";

const PLAYBACK_INTERVAL_MS = 1400;

const escapeStoryHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const emitStoryStep = (section, view, stateId, source) => {
  section.dispatchEvent(new CustomEvent("mobilelab:story-step", {
    bubbles: true,
    detail: { view, stateId, source },
  }));
};

const renderExplorationPhone = (state) => `
  <span class="story-phone__speaker" aria-hidden="true"></span>
  <div class="story-phone__status"><span>09:41</span><i></i></div>
  <div class="story-phone__screen story-phone__screen--${escapeStoryHtml(state.id.replace("state-", ""))}">
    <p>Visible App state</p>
    <strong>${escapeStoryHtml(state.label)}</strong>
    <span class="story-phone__focus"><i></i>${escapeStoryHtml(state.action)}</span>
    <div class="story-phone__blocks" aria-hidden="true"><i></i><i></i><i></i></div>
  </div>
  <small>AI visual focus · synthetic UI</small>
`;

const updateExplorationEdgePaths = (section) => {
  const map = section.querySelector(".exploration-map");
  const mapBounds = map?.getBoundingClientRect();
  if (!map || !mapBounds?.width || !mapBounds?.height) return;

  const relativeBounds = (stateId) => {
    const bounds = section.querySelector(`[data-exploration-state="${stateId}"]`)?.getBoundingClientRect();
    if (!bounds) return null;
    return {
      left: bounds.left - mapBounds.left,
      right: bounds.right - mapBounds.left,
      top: bounds.top - mapBounds.top,
      bottom: bounds.bottom - mapBounds.top,
      centerX: bounds.left - mapBounds.left + bounds.width / 2,
      centerY: bounds.top - mapBounds.top + bounds.height / 2,
    };
  };
  const coordinate = (value) => Math.round(value * 10) / 10;

  map.querySelectorAll("[data-exploration-edge]").forEach((edge) => {
    const source = relativeBounds(edge.dataset.edgeFrom);
    const target = relativeBounds(edge.dataset.edgeTo);
    if (!source || !target) return;

    const sameRow = Math.abs(source.centerY - target.centerY) < 24;
    const path = sameRow
      ? `M ${coordinate(source.right)} ${coordinate(source.centerY)} H ${coordinate(target.left)}`
      : `M ${coordinate(source.centerX)} ${coordinate(source.bottom)} V ${coordinate((source.bottom + target.top) / 2)} H ${coordinate(target.centerX)} V ${coordinate(target.top)}`;
    edge.setAttribute("d", path);
  });
};

export function renderExplorationSection() {
  return `
    <section class="lab-section exploration-section reveal" id="explore" aria-labelledby="explore-title">
      <div class="lab-section__heading lab-section__heading--row">
        <div>
          <p class="lab-eyebrow">Visual exploration map</p>
          <h2 id="explore-title">AI turns screens into a navigable product map.</h2>
        </div>
        <button class="story-play" type="button" data-exploration-play aria-label="Play App visual exploration">
          <i aria-hidden="true"></i><span>Play exploration</span>
        </button>
      </div>
      <div class="exploration-workbench" data-exploration-root data-story-state="state-home">
        <div class="exploration-phone" data-exploration-phone aria-label="Synthetic App state preview"></div>
        <div class="exploration-map" role="group" aria-label="App exploration states">
          <div class="exploration-map__meta"><span>6 states</span><span>5 transitions</span><span>1 candidate scenario</span></div>
          <svg class="exploration-map__edges" aria-hidden="true">
            <defs>
              <marker id="exploration-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><polygon points="0,0 8,4 0,8"></polygon></marker>
            </defs>
            <path data-exploration-edge="state-home" data-edge-from="state-home" data-edge-to="state-add" marker-end="url(#exploration-arrow)"></path>
            <path data-exploration-edge="state-add" data-edge-from="state-add" data-edge-to="state-choice" marker-end="url(#exploration-arrow)"></path>
            <path data-exploration-edge="state-choice" data-edge-from="state-choice" data-edge-to="state-pairing" marker-end="url(#exploration-arrow)"></path>
            <path data-exploration-edge="state-pairing" data-edge-from="state-pairing" data-edge-to="state-live" marker-end="url(#exploration-arrow)"></path>
            <path data-exploration-edge="state-live" data-edge-from="state-live" data-edge-to="state-alert" marker-end="url(#exploration-arrow)"></path>
          </svg>
          ${explorationStates.map((state) => `
            <button class="exploration-node exploration-node--${escapeStoryHtml(state.id.replace("state-", ""))}" type="button" data-exploration-state="${escapeStoryHtml(state.id)}" aria-pressed="false">
              <i>${escapeStoryHtml(state.index)}</i>
              <strong>${escapeStoryHtml(state.label)}</strong>
              <span>${escapeStoryHtml(state.status)}</span>
            </button>
          `).join("")}
        </div>
        <article class="exploration-inspector" data-exploration-inspector aria-live="polite">
          <span></span><h3></h3><p></p>
          <dl>
            <div><dt>Evidence</dt><dd></dd></div>
            <div><dt>Coverage</dt><dd></dd></div>
          </dl>
        </article>
      </div>
    </section>`;
}

export function mountExplorationView(root) {
  const section = root.querySelector("#explore");
  if (!section) {
    return () => {};
  }

  const workbench = section.querySelector("[data-exploration-root]");
  const cursor = createStoryCursor(explorationStates);
  const playButton = section.querySelector("[data-exploration-play]");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const map = section.querySelector(".exploration-map");
  let timer = null;
  let edgeFrame = null;

  const refreshEdges = () => {
    if (edgeFrame !== null) window.cancelAnimationFrame(edgeFrame);
    edgeFrame = window.requestAnimationFrame(() => {
      updateExplorationEdgePaths(section);
      edgeFrame = null;
    });
  };
  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(refreshEdges) : null;

  const stop = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    playButton.classList.remove("is-playing");
    playButton.querySelector("span").textContent = "Play exploration";
  };

  const select = (stateId, source = "manual") => {
    const state = cursor.select(stateId);
    workbench.dataset.storyState = state.id;
    section.querySelectorAll("[data-exploration-state]").forEach((button) => {
      const active = button.dataset.explorationState === state.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    section.querySelector("[data-exploration-phone]").innerHTML = renderExplorationPhone(state);
    const inspector = section.querySelector("[data-exploration-inspector]");
    inspector.querySelector("span").textContent = state.status;
    inspector.querySelector("h3").textContent = state.action;
    inspector.querySelector("p").textContent = `The visual map is currently grounded in ${state.label}.`;
    const values = inspector.querySelectorAll("dd");
    values[0].textContent = state.evidence;
    values[1].textContent = state.status === "Candidate" ? "Candidate scenario" : `${state.status} state`;
    const activeIndex = explorationStates.findIndex((candidate) => candidate.id === state.id);
    section.querySelectorAll("[data-exploration-edge]").forEach((edge) => {
      const targetIndex = explorationStates.findIndex((candidate) => candidate.id === edge.dataset.edgeTo);
      edge.classList.toggle("is-active", targetIndex <= activeIndex);
    });
    emitStoryStep(section, "exploration", state.id, source);
    return state;
  };

  const advance = () => {
    if (cursor.currentId === explorationStates.at(-1).id) {
      cursor.reset();
    }
    const state = cursor.next();
    select(state.id, "playback");
    if (state.id === explorationStates.at(-1).id) {
      stop();
    }
  };

  const onPlay = () => {
    if (timer !== null) {
      stop();
      return;
    }
    if (motionQuery.matches) {
      advance();
      return;
    }
    playButton.classList.add("is-playing");
    playButton.querySelector("span").textContent = "Pause exploration";
    advance();
    if (cursor.currentId !== explorationStates.at(-1).id) {
      timer = window.setInterval(advance, PLAYBACK_INTERVAL_MS);
    }
  };

  const onStateClick = (event) => {
    stop();
    select(event.currentTarget.dataset.explorationState);
  };
  const onVisibilityChange = () => {
    if (document.hidden) stop();
  };

  const stateButtons = [...section.querySelectorAll("[data-exploration-state]")];
  stateButtons.forEach((button) => button.addEventListener("click", onStateClick));
  playButton.addEventListener("click", onPlay);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("resize", refreshEdges);
  resizeObserver?.observe(map);
  select(cursor.currentId, "manual");
  refreshEdges();

  return () => {
    stop();
    if (edgeFrame !== null) window.cancelAnimationFrame(edgeFrame);
    resizeObserver?.disconnect();
    stateButtons.forEach((button) => button.removeEventListener("click", onStateClick));
    playButton.removeEventListener("click", onPlay);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", refreshEdges);
  };
}

export function renderPlanSection() {
  return `
    <section class="lab-section plan-section reveal" id="plan" aria-labelledby="plan-title">
      <div class="lab-section__heading lab-section__heading--row">
        <div>
          <p class="lab-eyebrow">Test plan &amp; task control plane</p>
          <h2 id="plan-title">Intent becomes schedulable work.</h2>
        </div>
        <button class="story-play" type="button" data-plan-play aria-label="Show quality task orchestration">
          <i aria-hidden="true"></i><span>Show orchestration</span>
        </button>
      </div>
      <div class="plan-control-plane" data-plan-root data-story-state="task-explore">
        <aside class="plan-brief">
          <span class="story-panel-label">Plan brief</span>
          <small>Risk-shaped quality intent</small>
          <h3>${escapeStoryHtml(showcaseScenario.title)}</h3>
          <p>${escapeStoryHtml(showcaseScenario.goal)}</p>
          <dl>
            <div><dt>Trigger</dt><dd>Candidate change</dd></div>
            <div><dt>Risk</dt><dd>App + camera path</dd></div>
            <div><dt>Gate</dt><dd>Evidence review</dd></div>
          </dl>
        </aside>
        <div class="plan-taskboard">
          <div class="plan-route" aria-label="Plan to lease request flow"><span>Plan</span><i></i><span>Tasks</span><i></i><span>Lease request</span></div>
          <div class="plan-task-list" role="group" aria-label="Quality plan tasks">
            ${planTasks.map((task) => `
              <button type="button" data-plan-task="${escapeStoryHtml(task.id)}" aria-pressed="false">
                <i>${escapeStoryHtml(task.index)}</i>
                <span><strong>${escapeStoryHtml(task.label)}</strong><small>${escapeStoryHtml(task.owner)}</small></span>
                <em>${escapeStoryHtml(task.status)}</em>
              </button>
            `).join("")}
          </div>
          <article class="plan-task-detail" data-plan-inspector aria-live="polite">
            <span></span><strong></strong><p></p>
          </article>
        </div>
        <aside class="plan-capacity">
          <span class="story-panel-label">Capacity match</span>
          <h3>Only reserve what the task needs.</h3>
          <div>
            ${storyCapabilities.map((capability) => `
              <span data-plan-capability="${escapeStoryHtml(capability.id)}"><i></i>${escapeStoryHtml(capability.label)}</span>
            `).join("")}
          </div>
          <small>Selected capabilities become the Device Farm lease request.</small>
        </aside>
      </div>
    </section>`;
}

export function mountPlanView(root) {
  const section = root.querySelector("#plan");
  if (!section) return () => {};

  const controlPlane = section.querySelector("[data-plan-root]");
  const cursor = createStoryCursor(planTasks);
  const playButton = section.querySelector("[data-plan-play]");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer = null;

  const stop = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    playButton.classList.remove("is-playing");
    playButton.querySelector("span").textContent = "Show orchestration";
  };

  const select = (taskId, source = "manual") => {
    const task = cursor.select(taskId);
    controlPlane.dataset.storyState = task.id;
    section.querySelectorAll("[data-plan-task]").forEach((button) => {
      const active = button.dataset.planTask === task.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    section.querySelectorAll("[data-plan-capability]").forEach((chip) => {
      chip.classList.toggle("is-active", task.capabilityIds.includes(chip.dataset.planCapability));
    });
    const inspector = section.querySelector("[data-plan-inspector]");
    inspector.querySelector("span").textContent = task.status;
    inspector.querySelector("strong").textContent = task.owner;
    inspector.querySelector("p").textContent = task.completion;
    emitStoryStep(section, "plan", task.id, source);
    return task;
  };

  const advance = () => {
    if (cursor.currentId === planTasks.at(-1).id) cursor.reset();
    const task = cursor.next();
    select(task.id, "playback");
    if (task.id === planTasks.at(-1).id) stop();
  };
  const onPlay = () => {
    if (timer !== null) return stop();
    if (motionQuery.matches) return advance();
    playButton.classList.add("is-playing");
    playButton.querySelector("span").textContent = "Pause orchestration";
    advance();
    if (cursor.currentId !== planTasks.at(-1).id) timer = window.setInterval(advance, PLAYBACK_INTERVAL_MS);
  };
  const onTaskClick = (event) => {
    stop();
    select(event.currentTarget.dataset.planTask);
  };
  const onVisibilityChange = () => {
    if (document.hidden) stop();
  };
  const taskButtons = [...section.querySelectorAll("[data-plan-task]")];
  taskButtons.forEach((button) => button.addEventListener("click", onTaskClick));
  playButton.addEventListener("click", onPlay);
  document.addEventListener("visibilitychange", onVisibilityChange);
  select(cursor.currentId);

  return () => {
    stop();
    taskButtons.forEach((button) => button.removeEventListener("click", onTaskClick));
    playButton.removeEventListener("click", onPlay);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

export function renderInteractionSection() {
  return `
    <section class="lab-section interaction-section reveal" id="run" aria-labelledby="run-title">
      <div class="lab-section__heading lab-section__heading--row">
        <div>
          <p class="lab-eyebrow">App × IoT interaction theatre</p>
          <h2 id="run-title">One action. Two realities. One proof.</h2>
        </div>
        <span class="interaction-boundary"><i></i> Simulated walkthrough</span>
      </div>
      <div class="interaction-shell" data-interaction-root data-story-state="pair" data-interaction-beat="0">
        <div class="interaction-moments" role="group" aria-label="Cross-device quality moments">
          ${interactionMoments.map((moment) => `
            <button type="button" data-interaction-moment="${escapeStoryHtml(moment.id)}" aria-pressed="false">
              <i>${escapeStoryHtml(moment.index)}</i><strong>${escapeStoryHtml(moment.label)}</strong><span>${escapeStoryHtml(moment.support)}</span>
            </button>
          `).join("")}
        </div>
        <div class="interaction-theatre">
          <article class="interaction-app-stage">
            <span class="story-panel-label">App automation</span>
            <div class="interaction-phone" data-interaction-phone></div>
          </article>
          <div class="interaction-event-rail" aria-label="App to device event flow">
            ${interactionMoments[0].beats.map((beat, index) => `
              <span data-interaction-beat-index="${index}"><i>${String(index + 1).padStart(2, "0")}</i><strong>${escapeStoryHtml(beat)}</strong></span>
            `).join("<em aria-hidden=\"true\"></em>")}
          </div>
          <article class="interaction-iot-stage">
            <span class="story-panel-label">Physical device</span>
            <img src="../assets/mobile-lab/iot-bench.webp" alt="An anonymized camera and IoT bench used in the simulated quality walkthrough" loading="lazy" />
            <div data-interaction-device><span></span><strong></strong></div>
          </article>
        </div>
        <div class="interaction-controlbar">
          <button class="story-play" type="button" data-interaction-play><i aria-hidden="true"></i><span>Run pairing walkthrough</span></button>
          <article data-interaction-inspector aria-live="polite"><span></span><strong></strong><p></p></article>
        </div>
      </div>
    </section>`;
}

export function mountInteractionView(root) {
  const section = root.querySelector("#run");
  if (!section) return () => {};

  const shell = section.querySelector("[data-interaction-root]");
  const cursor = createStoryCursor(interactionMoments);
  const playButton = section.querySelector("[data-interaction-play]");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer = null;
  let beatIndex = 0;

  const stop = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    playButton.classList.remove("is-playing");
  };
  const updatePlayLabel = () => {
    const verb = cursor.current.id === "pair" ? "pairing" : cursor.current.id;
    playButton.querySelector("span").textContent = `Run ${verb} walkthrough`;
  };
  const setBeat = (nextBeatIndex) => {
    beatIndex = Math.max(0, Math.min(nextBeatIndex, cursor.current.beats.length - 1));
    shell.dataset.interactionBeat = String(beatIndex);
    section.querySelectorAll("[data-interaction-beat-index]").forEach((beat) => {
      beat.classList.toggle("is-active", Number(beat.dataset.interactionBeatIndex) <= beatIndex);
    });
  };
  const select = (momentId, source = "manual") => {
    stop();
    const moment = cursor.select(momentId);
    shell.dataset.storyState = moment.id;
    section.querySelectorAll("[data-interaction-moment]").forEach((button) => {
      const active = button.dataset.interactionMoment === moment.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    section.querySelector("[data-interaction-phone]").innerHTML = `
      <span>Automated action</span><strong>${escapeStoryHtml(moment.appAction)}</strong><i aria-hidden="true"></i>`;
    const device = section.querySelector("[data-interaction-device]");
    device.querySelector("span").textContent = moment.support;
    device.querySelector("strong").textContent = moment.deviceAction;
    const inspector = section.querySelector("[data-interaction-inspector]");
    inspector.querySelector("span").textContent = moment.evidence;
    inspector.querySelector("strong").textContent = moment.outcome;
    inspector.querySelector("p").textContent = "App state and physical response stay on the same evidence path.";
    setBeat(0);
    updatePlayLabel();
    emitStoryStep(section, "interaction", moment.id, source);
    return moment;
  };
  const advanceBeat = () => {
    setBeat(beatIndex + 1);
    emitStoryStep(section, "interaction", cursor.currentId, "playback");
    if (beatIndex === cursor.current.beats.length - 1) {
      stop();
      updatePlayLabel();
    }
  };
  const onPlay = () => {
    if (timer !== null) {
      stop();
      updatePlayLabel();
      return;
    }
    setBeat(0);
    emitStoryStep(section, "interaction", cursor.currentId, "playback");
    if (motionQuery.matches) return;
    playButton.classList.add("is-playing");
    playButton.querySelector("span").textContent = "Pause walkthrough";
    timer = window.setInterval(advanceBeat, PLAYBACK_INTERVAL_MS);
  };
  const onMomentClick = (event) => select(event.currentTarget.dataset.interactionMoment);
  const onVisibilityChange = () => {
    if (document.hidden) {
      stop();
      updatePlayLabel();
    }
  };
  const momentButtons = [...section.querySelectorAll("[data-interaction-moment]")];
  momentButtons.forEach((button) => button.addEventListener("click", onMomentClick));
  playButton.addEventListener("click", onPlay);
  document.addEventListener("visibilitychange", onVisibilityChange);
  select(cursor.currentId);

  return () => {
    stop();
    momentButtons.forEach((button) => button.removeEventListener("click", onMomentClick));
    playButton.removeEventListener("click", onPlay);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

export function renderReplaySection() {
  return `
    <section class="lab-section replay-section reveal" id="replay" aria-labelledby="replay-title">
      <div class="lab-section__heading lab-section__heading--row">
        <div>
          <p class="lab-eyebrow">Report &amp; synchronized replay</p>
          <h2 id="replay-title">Every signal returns to one playhead.</h2>
        </div>
        <button class="story-play" type="button" data-replay-play><i aria-hidden="true"></i><span>Replay evidence</span></button>
      </div>
      <div class="replay-summary">
        <span><small>Scenario</small><strong>${escapeStoryHtml(showcaseScenario.title)}</strong></span>
        <span><small>Terminal</small><strong>Completed</strong></span>
        <span><small>Quality decision</small><strong>Review-ready</strong></span>
        <span><small>Evidence</small><strong>5 correlated markers</strong></span>
      </div>
      <div class="replay-workbench" data-replay-root data-story-state="marker-step" style="--replay-progress: 0%">
        <div class="replay-media" data-replay-media>
          <div class="replay-media__chrome"><span></span><span></span><span></span><small>00:00 / 00:49</small></div>
          <div class="replay-media__screen"><span class="replay-phone"><i></i><b></b><em></em></span><span class="replay-pip">IoT</span></div>
          <div class="replay-media__caption"><span>Current evidence</span><strong>Scenario begins</strong></div>
        </div>
        <div class="replay-timeline">
          <div class="replay-track" role="group" aria-label="Synchronized evidence markers">
            <i class="replay-track__line"></i><i class="replay-track__progress"></i>
            ${replayMarkers.map((marker) => `
              <button type="button" data-replay-marker="${escapeStoryHtml(marker.id)}" style="--marker-position: ${(marker.timeSeconds / 49) * 100}%" aria-pressed="false">
                <i></i><span>${escapeStoryHtml(marker.kind)}</span><strong>${escapeStoryHtml(marker.label)}</strong><small>00:${String(marker.timeSeconds).padStart(2, "0")}</small>
              </button>
            `).join("")}
          </div>
          <label class="replay-scrubber"><span>Single playhead</span><input data-replay-playhead type="range" min="0" max="49" value="0" step="1" aria-label="Replay position" /></label>
          <small class="replay-unavailable" hidden>Timeline unavailable</small>
        </div>
        <article class="replay-inspector" data-replay-inspector aria-live="polite">
          <span></span><h3></h3><p></p><dl><div><dt>Source</dt><dd></dd></div><div><dt>Result</dt><dd></dd></div></dl>
        </article>
      </div>
      <div class="replay-report">
        <span><small>Scenario</small><strong>1 review package</strong></span>
        <span><small>Evidence</small><strong>Complete</strong></span>
        <span><small>Framework gap</small><strong>Visible when present</strong></span>
        <span><small>CI Gate</small><strong>Awaiting policy review</strong></span>
      </div>
    </section>`;
}

export function mountReplayView(root) {
  const section = root.querySelector("#replay");
  if (!section) return () => {};

  const workbench = section.querySelector("[data-replay-root]");
  const cursor = createStoryCursor(replayMarkers);
  const playButton = section.querySelector("[data-replay-play]");
  const playhead = section.querySelector("[data-replay-playhead]");
  const unavailable = section.querySelector(".replay-unavailable");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timelineAvailable = replayMarkers.every((marker) => Number.isFinite(marker.timeSeconds));
  let timer = null;

  const stop = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    playButton.classList.remove("is-playing");
    playButton.querySelector("span").textContent = "Replay evidence";
  };
  const select = (markerId, source = "manual") => {
    const marker = cursor.select(markerId);
    const progress = (marker.timeSeconds / replayMarkers.at(-1).timeSeconds) * 100;
    workbench.dataset.storyState = marker.id;
    workbench.style.setProperty("--replay-progress", `${progress}%`);
    playhead.value = String(marker.timeSeconds);
    section.querySelectorAll("[data-replay-marker]").forEach((button) => {
      const active = button.dataset.replayMarker === marker.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const media = section.querySelector("[data-replay-media]");
    media.dataset.markerKind = marker.kind.toLowerCase().replaceAll(" ", "-");
    media.querySelector(".replay-media__chrome small").textContent = `00:${String(marker.timeSeconds).padStart(2, "0")} / 00:49`;
    media.querySelector(".replay-media__caption strong").textContent = marker.label;
    const inspector = section.querySelector("[data-replay-inspector]");
    inspector.querySelector("span").textContent = marker.kind;
    inspector.querySelector("h3").textContent = marker.label;
    inspector.querySelector("p").textContent = marker.kind === "Decision"
      ? "Execution completed. Quality remains review-ready until policy decides."
      : "The screen, device response, and supporting evidence share this moment.";
    const values = inspector.querySelectorAll("dd");
    values[0].textContent = marker.source;
    values[1].textContent = marker.result;
    emitStoryStep(section, "replay", marker.id, source);
    return marker;
  };
  const advance = () => {
    if (cursor.currentId === replayMarkers.at(-1).id) cursor.reset();
    const marker = cursor.next();
    select(marker.id, "playback");
    if (marker.id === replayMarkers.at(-1).id) stop();
  };
  const onPlay = () => {
    if (!timelineAvailable) return;
    if (timer !== null) return stop();
    if (motionQuery.matches) return advance();
    playButton.classList.add("is-playing");
    playButton.querySelector("span").textContent = "Pause replay";
    advance();
    if (cursor.currentId !== replayMarkers.at(-1).id) timer = window.setInterval(advance, PLAYBACK_INTERVAL_MS);
  };
  const onMarkerClick = (event) => {
    stop();
    select(event.currentTarget.dataset.replayMarker);
  };
  const onPlayheadInput = () => {
    stop();
    const time = Number(playhead.value);
    const nearest = replayMarkers.reduce((best, marker) =>
      Math.abs(marker.timeSeconds - time) < Math.abs(best.timeSeconds - time) ? marker : best
    );
    select(nearest.id);
  };
  const onVisibilityChange = () => {
    if (document.hidden) stop();
  };
  const markerButtons = [...section.querySelectorAll("[data-replay-marker]")];
  markerButtons.forEach((button) => button.addEventListener("click", onMarkerClick));
  playButton.addEventListener("click", onPlay);
  playhead.addEventListener("input", onPlayheadInput);
  document.addEventListener("visibilitychange", onVisibilityChange);
  if (!timelineAvailable) {
    playButton.disabled = true;
    playhead.disabled = true;
    unavailable.hidden = false;
  }
  select(cursor.currentId);

  return () => {
    stop();
    markerButtons.forEach((button) => button.removeEventListener("click", onMarkerClick));
    playButton.removeEventListener("click", onPlay);
    playhead.removeEventListener("input", onPlayheadInput);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

export function mountMobileLabStoryViews(root) {
  const cleanups = [
    mountExplorationView(root),
    mountPlanView(root),
    mountInteractionView(root),
    mountReplayView(root),
  ];
  return () => cleanups.forEach((cleanup) => cleanup());
}
