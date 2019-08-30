require("chai").should();
require("chai").expect;
var BN = web3.utils.BN;
require("chai").use(require("chai-bignumber")(BN));

var Hackathon = artifacts.require("./HackathonMunon.sol");

contract(Hackathon, function(accounts) {
  beforeEach(async () => {
    this.hackathonInstance = await Hackathon.deployed();
  });

  describe("Hackathon Validations", () => {
    it("...should create a hackathon.", async () => {
      const receipt = await this.hackathonInstance.createHackathon(
        "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq",
        "Hackaton TGU",
        {
          from: accounts[0]
        }
      );
      receipt.logs.length.should.be.equal(1, "trigger one event");
      receipt.logs[0].event.should.be.equal(
        "HackathonCreation",
        "should be the HackathonCreation event"
      );
      expect(receipt.logs[0].args.image_hash).to.be.equal(
        "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq",
        "logs the added hackathon image hash"
      );
      expect(receipt.logs[0].args.name).to.be.equal(
        "Hackaton TGU",
        "logs the added hackathon name"
      );

      const hackathon = await this.hackathonInstance.hackathons(1);
      hackathon.host_addr.should.equal(accounts[0], "host should be creator");
      hackathon.state
        .toNumber()
        .should.equal(0, "Hackathon state should be initial");
      hackathon.image_hash.should.equal(
        "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq",
        "host should be creator"
      );
      hackathon.name.should.equal("Hackaton TGU", "host should be creator");
      const totalHackathons = await this.hackathonInstance.hackathon_count();
      totalHackathons.toNumber().should.equal(1);
    });

    it("...should allow to join a hackathon.", async () => {
      let amount = web3.utils.toWei("0.03", "ether");
      const receipt = await this.hackathonInstance.join(
        1,
        {
          from: accounts[1],
          value: amount
        }
      );
      receipt.logs.length.should.be.equal(1, "trigger one event");
      receipt.logs[0].event.should.be.equal(
        "Registration",
        "should be the Registration event"
      );
      expect(receipt.logs[0].args.hackathon_id.toNumber()).to.be.equal(
        1,
        "logs the hackathon id"
      );
      expect(receipt.logs[0].args.participant_addr).to.be.equal(
        accounts[1],
        "logs the hacker address"
      );
      var revert = false;
      try {
        amount = web3.utils.toWei("0.05", "ether");
        await this.hackathonInstance.join(
          1,
          {
            from: accounts[2],
            value: amount
          }
        );
      } catch (err) {
        revert = true;
        assert(err.reason === "Amount not equal to pay fee");
      }
      expect(revert).to.equal(true, "Should revert less fee");

      revert = false;
      try {
        amount = web3.utils.toWei("15", "finney");
        await this.hackathonInstance.join(
          1,
          {
            from: accounts[2],
            value: amount
          }
        );
      } catch (err) {
        revert = true;
        assert(err.reason === "Amount not equal to pay fee");
      }
      expect(revert).to.equal(true, "Should revert more than fee");

      revert = false;
      try {
        amount = web3.utils.toWei("0.03", "ether");
        await this.hackathonInstance.join(
          1,
          {
            from: accounts[1],
            value: amount
          }
        );
      } catch (err) {
        revert = true;
        assert(err.reason === "Participant has joined");
      }
      expect(revert).to.equal(
        true,
        "Should revert on participant already joined"
      );
    });

    it("...should enable to open review", async () => {
      let amount = web3.utils.toWei("0.03", "ether");
      await this.hackathonInstance.join(
        1,
        {
          from: accounts[2],
          value: amount
        }
      );
      await this.hackathonInstance.join(
        1,
        {
          from: accounts[9],
          value: amount
        }
      );

      var revert = false;
      try {
        await this.hackathonInstance.rate(1, accounts[2], 1, {
          from: accounts[1]
        });
      } catch (err) {
        revert = true;
        assert(err.reason === "Hackathon review is not enabled");
      }
      expect(revert).to.equal(true, "Review is not enabled");

      var revert = false;
      try {
        await this.hackathonInstance.enableHackathonReview(1, {
          from: accounts[1]
        });
      } catch (err) {
        revert = true;
        assert(err.reason === "You are not the hackathon host");
      }
      expect(revert).to.equal(true, "Should revert on not host");

      const receipt = await this.hackathonInstance.enableHackathonReview(1, {
        from: accounts[0]
      });

      receipt.logs.length.should.be.equal(1, "trigger one event");
      receipt.logs[0].event.should.be.equal(
        "HackathonReviewEnabled",
        "should be the HackathonReviewEnabled event"
      );
      expect(receipt.logs[0].args.hackathon_id.toNumber()).to.be.equal(
        1,
        "logs the hackathon id"
      );

      revert = false;
      try {
        await this.hackathonInstance.join(
          1,
          {
            from: accounts[3],
            value: amount
          }
        );
      } catch (err) {
        revert = true;
        assert(err.reason === "Hackathon registration is not open");
      }
      expect(revert).to.equal(true, "Should revert on registration not open");
    });

    it("...should allow to rate a participant.", async () => {
      var revert = false;
      try {
        await this.hackathonInstance.rate(1, accounts[3], 1, {
          from: accounts[1]
        });
      } catch (err) {
        revert = true;
        assert(err.reason === "Participant does not exists");
      }
      expect(revert).to.equal(true, "Review is not enabled");

      var revert = false;
      try {
        await this.hackathonInstance.rate(1, accounts[2], 10, {
          from: accounts[1]
        });
      } catch (err) {
        revert = true;
        assert(err.reason === "Points are greater than 5");
      }
      expect(revert).to.equal(true, "Should revert on points greater than 5");

      var revert = false;
      try {
        await this.hackathonInstance.rate(1, accounts[2], 4, {
          from: accounts[3]
        });
      } catch (err) {
        revert = true;
        assert(err.reason === "Participant has not joined");
      }
      expect(revert).to.equal(
        true,
        "Should revert on prticipant has not joined"
      );

      const receipt = await this.hackathonInstance.rate(1, accounts[2], 4, {
        from: accounts[1]
      });
      receipt.logs.length.should.be.equal(1, "trigger one event");
      receipt.logs[0].event.should.be.equal(
        "RatingSubmited",
        "should be the RatingSubmited event"
      );
      expect(receipt.logs[0].args.hackathon_id.toNumber()).to.be.equal(
        1,
        "logs the hackathon id"
      );
      expect(receipt.logs[0].args.reviewer_addr).to.be.equal(
        accounts[1],
        "logs the reviewer address"
      );
      expect(receipt.logs[0].args.reviewed_addr).to.be.equal(
        accounts[2],
        "logs the reviewed address"
      );
      expect(receipt.logs[0].args.points.toNumber()).to.be.equal(
        4,
        "logs the points"
      );
      const participantPoints = await this.hackathonInstance.participant_ratings(
        1,
        accounts[1],
        accounts[2]
      );
      participantPoints.toNumber().should.equal(4);
      const totalPoints = await this.hackathonInstance.total_hackathon_points(
        1
      );
      totalPoints.toNumber().should.equal(4);
    });

    it("...should update rate of a participant.", async () => {
      await this.hackathonInstance.rate(1, accounts[2], 1, {
        from: accounts[1]
      });
      const participantPoints = await this.hackathonInstance.participant_ratings(
        1,
        accounts[1],
        accounts[2]
      );
      participantPoints.toNumber().should.equal(1);
      let totalPoints = await this.hackathonInstance.total_hackathon_points(1);
      totalPoints.toNumber().should.equal(1);

      await this.hackathonInstance.rate(1, accounts[9], 1, {
        from: accounts[1]
      });
      totalPoints = await this.hackathonInstance.total_hackathon_points(1);
      totalPoints.toNumber().should.equal(2);
    });
  });
});
