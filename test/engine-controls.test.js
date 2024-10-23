"use strict";

import engineFactory from "../src/index";
import sinon from "sinon";

describe("Engine: fact priority", () => {
  let engine;
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });
  const event = { type: "adult-human-admins" };

  let eventSpy;
  let ageStub;
  let segmentStub;

  function setup() {
    ageStub = sandbox.stub();
    segmentStub = sandbox.stub();
    eventSpy = sandbox.stub();
    engine = engineFactory();

    let conditions = {
      any: [
        {
          fact: "age",
          operator: "greaterThanInclusive",
          value: 18,
        },
      ],
    };
    let rule = factories.rule({ conditions, event, priority: 100 });
    engine.addRule(rule);

    conditions = {
      any: [
        {
          fact: "segment",
          operator: "equal",
          value: "human",
        },
      ],
    };
    rule = factories.rule({ conditions, event });
    engine.addRule(rule);

    engine.addFact("age", ageStub, { priority: 100 });
    engine.addFact("segment", segmentStub, { priority: 50 });
  }

  describe("stop()", () => {
    it("stops the rules from executing", async () => {
      setup();
      ageStub.returns(20); // success
      engine.on("success", (event) => {
        eventSpy();
        engine.stop();
      });
      await engine.run();
      expect(eventSpy).to.have.been.calledOnce();
      expect(ageStub).to.have.been.calledOnce();
      expect(segmentStub).to.not.have.been.called();
    });
  });
});
