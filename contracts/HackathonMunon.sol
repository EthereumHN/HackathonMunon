pragma solidity ^0.5.0;

import "node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract HackathonMunon
{
  // Events
  event HackathonCreation
  (
    address hackaton_host,
    uint256 hackathon_id,
    string image_hash,
    string name
  );

  event Registration
  (
    uint256 hackathon_id,
    address participant_addr,
    string image_hash,
    string nickname
  );

  event RatingSubmited
  (
    uint256 hackathon_id,
    address reviewer_addr,
    address reviewed_addr,
    uint256 points
  );

  event CashOut
  (
    uint256 hackathon_id,
    address participant_addr,
    uint256 reward
  );

  event HackathonReviewEnabled
  (
    uint256 hackathon_id
  );

  event HackathonFinished
  (
    uint256 hackathon_id
  );

  using SafeMath for uint256;
  // Structs
  struct Hackathon
  {
    address host_addr;
    HackathonState state;
    string image_hash;
    string name;
  }

  struct Participant
  {
    address addr;
    uint256 points;
    string image_hash;
    string nickname;
  }

  // Enums
  enum HackathonState { RegistrationOpen, ReviewEnabled, Finished }

  // Public variables
  mapping(uint256 => Hackathon) public hackathons; // Stores hackathons data
  mapping(uint256 => mapping(address => Participant)) public hackathon_participants; // Stores participant data
  // Rating history, enables correcting ratings and prevents rating
  mapping(uint256 => mapping(address => mapping(address => uint256))) public participant_ratings;
  uint256 public hackathon_count; // Helps generating a new hackathon id
  mapping(uint256 => mapping(address => bool)) public participant_has_cashed_out; // Helps preventing double cash out
  mapping(uint256 => uint256) public total_hackathon_points; // Helps calculating pot splits
  uint256 entry_fee = 10 finney; // Hackathon entry fee

  // Modifiers
  modifier paysEntryFee()
  {
    require(msg.value == entry_fee, "Amount not equal to pay fee");
    _;
  }

  modifier hasNotJoined(uint256 hackathon_id)
  {
    require(hackathon_participants[hackathon_id][msg.sender].addr == address(0), "Participant has joined");
    _;
  }

  modifier hasJoined(uint256 hackathon_id)
  {
    require(hackathon_participants[hackathon_id][msg.sender].addr != address(0), "Participant has not joined");
    _;
  }

  modifier participantExists(uint256 hackathon_id, address participant_addr)
  {
    require(hackathon_participants[hackathon_id][participant_addr].addr != address(0), "Participant does not exists");
    _;
  }

  modifier pointsAreValid(uint256 points)
  {
    require(points <= 5, "Points are greater than 5");
    _;
  }

  modifier hasNotCashedOut(uint256 hackathon_id, address participant_addr)
  {
    require(!participant_has_cashed_out[hackathon_id][participant_addr], "Participant has already cashed out");
    _;
  }

  modifier isRegistrationOpen(uint256 hackathon_id)
  {
    require(hackathons[hackathon_id].state == HackathonState.RegistrationOpen, "Hackathon registration is not open");
    _;
  }

  modifier isReviewEnabled(uint256 hackathon_id)
  {
    require(hackathons[hackathon_id].state == HackathonState.ReviewEnabled, "Hackathon review is not enabled");
    _;
  }

  modifier isFinished(uint256 hackathon_id)
  {
    require(hackathons[hackathon_id].state == HackathonState.Finished, "Hackathon is not finished");
    _;
  }

  modifier isHackathonHost(uint256 hackathon_id)
  {
    require(hackathons[hackathon_id].host_addr == msg.sender, "You are not the hackathon host");
    _;
  }

  // Public methods
  function createHackathon(string memory image_hash, string memory _name) public
  {
    hackathon_count += 1;
    hackathons[hackathon_count] = Hackathon(msg.sender, HackathonState.RegistrationOpen, image_hash, _name);
    emit HackathonCreation(msg.sender, hackathon_count, image_hash,_name);
  }

  function join(
    uint256 hackathon_id,
    string memory image_hash,
    string memory nickname
  ) public payable paysEntryFee hasNotJoined(hackathon_id) isRegistrationOpen(hackathon_id)
  {
    Participant memory participant = Participant(msg.sender, 0,image_hash, nickname);
    hackathon_participants[hackathon_id][msg.sender] = participant;
    emit Registration(hackathon_id, msg.sender,image_hash, nickname);
  }

  function rate(
    uint256 hackathon_id,
    address participant_addr,
    uint256 points
  ) public hasJoined(hackathon_id) participantExists(hackathon_id, participant_addr) pointsAreValid(points) isReviewEnabled(hackathon_id)
  {
    uint256 rating_stored = participant_ratings[hackathon_id][msg.sender][participant_addr];
    hackathon_participants[hackathon_id][participant_addr].points = hackathon_participants[hackathon_id][participant_addr].points.add(
      points).sub(rating_stored);
    total_hackathon_points[hackathon_id] = total_hackathon_points[hackathon_id].add(points).sub(rating_stored);
    participant_ratings[hackathon_id][msg.sender][participant_addr] = points;
    emit RatingSubmited(hackathon_id, msg.sender, participant_addr, points);
  }

  function cashOut(uint256 hackathon_id)
    public hasJoined(hackathon_id) hasNotCashedOut(hackathon_id, msg.sender) isFinished(hackathon_id) returns(uint256)
  {
    uint256 total_points = total_hackathon_points[hackathon_id];
    uint256 my_points = hackathon_participants[hackathon_id][msg.sender].points;

    // Calculate reward
    uint256 total_pot = address(this).balance;
    uint256 my_percentage = my_points.div(total_points);
    uint256 my_reward = total_pot.mul(my_percentage);

    msg.sender.transfer(my_reward);
    participant_has_cashed_out[hackathon_id][msg.sender] = true;
    emit CashOut(hackathon_id, msg.sender, my_reward);
  }

  function enableHackathonReview(uint256 hackathon_id) public isHackathonHost(hackathon_id)
  {
    hackathons[hackathon_id].state = HackathonState.ReviewEnabled;
    emit HackathonReviewEnabled(hackathon_id);
  }

  function finishHackathon(uint256 hackathon_id) public isHackathonHost(hackathon_id)
  {
    hackathons[hackathon_id].state = HackathonState.Finished;
    emit HackathonFinished(hackathon_id);
  }
}
