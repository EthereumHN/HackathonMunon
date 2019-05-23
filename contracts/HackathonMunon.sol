pragma solidity ^0.5.0;

contract HackathonMunon
{
  // Events
  event HackathonCreation
  (
    uint hackathon_id
  );

  event Registration
  (
    uint hackathon_id,
    address participant_addr
  );

  // Structs
  struct Hackathon
  {
    address host_addr;
    HackathonState state;
  }

  struct Participant
  {
    address addr;
    uint points;
  }

  // Enums
  enum HackathonState { RegistrationOpen, ReviewEnabled, Finished }

  // Public variables
  mapping(uint => Hackathon) public hackathons; // Stores hackathons data
  mapping(uint => mapping(address => Participant)) public hackathon_participants; // Stores participant data
  mapping(uint => mapping(address => mapping(address => uint))) public participant_ratings; // Rating history, enables correcting ratings and prevents rating
  uint hackathon_count; // Helps generating a new hackathon id
  mapping(uint => mapping(address => bool)) public participant_has_cashed_out;
  mapping(uint => uint256) public total_hackathon_points;
  uint entry_fee = 10 finney;

  // Modifiers
  modifier paysEntryFee()
  {
    require(msg.value == entry_fee, "Amount not equal to pay fee");
    _;
  }

  modifier hasNotJoined(uint hackathon_id)
  {
    require(hackathon_participants[hackathon_id][msg.sender].addr == address(0), "Participant has joined");
    _;
  }

  modifier hasJoined(uint hackathon_id)
  {
    require(hackathon_participants[hackathon_id][msg.sender].addr != address(0), "Participant has not joined");
    _;
  }

  modifier participantExists(uint hackathon_id, address participant_addr)
  {
    require(hackathon_participants[hackathon_id][participant_addr].addr != address(0), "Participant does not exists");
    _;
  }

  modifier pointsAreValid(uint8 points)
  {
    require(points <= 5, "Points are greater than 5");
    _;
  }

  modifier hasNotCashedOut(uint hackathon_id, address participant_addr)
  {
    require(!participant_has_cashed_out[hackathon_id][participant_addr], "Participant has already cashed out");
    _;
  }

  modifier isRegistrationOpen(uint hackathon_id)
  {
    require(hackathons[hackathon_id].state == HackathonState.RegistrationOpen, "Hackathon registration is not open");
    _;
  }

  modifier isReviewEnabled(uint hackathon_id)
  {
    require(hackathons[hackathon_id].state == HackathonState.ReviewEnabled, "Hackathon review is not enabled");
    _;
  }

  modifier isFinished(uint hackathon_id)
  {
    require(hackathons[hackathon_id].state == HackathonState.Finished, "Hackathon is not finished");
    _;
  }

  modifier isHackathonHost(uint hackathon_id)
  {
    require(hackathons[hackathon_id].host_addr == msg.sender, "You are not the hackathon host");
    _;
  }

  // Public methods
  function createHackathon() public
  {
    hackathon_count += 1;
    hackathons[hackathon_count] = Hackathon(msg.sender, HackathonState.RegistrationOpen);
    emit HackathonCreation(hackathon_count);
  }

  function join(uint hackathon_id) public payable paysEntryFee hasNotJoined(hackathon_id) isRegistrationOpen(hackathon_id)
  {
    Participant memory participant = Participant(msg.sender, 0);
    hackathon_participants[hackathon_id][msg.sender] = participant;
    emit Registration(hackathon_id, msg.sender);
  }

  //TODO: Integer Underflow y Overflow
  function rate(
    uint hackathon_id,
    address participant_addr,
    uint8 points
  ) public hasJoined(hackathon_id) participantExists(hackathon_id, participant_addr) pointsAreValid(points) isReviewEnabled(hackathon_id)
  {
    uint rating_stored = participant_ratings[hackathon_id][msg.sender][participant_addr];
    hackathon_participants[hackathon_id][participant_addr].points += points - rating_stored;
    total_hackathon_points[hackathon_id] += points - rating_stored;
    participant_ratings[hackathon_id][msg.sender][participant_addr] = points;
  }

  //TODO: Integer Underflow y Overflow
  function cashOut(uint hackathon_id) public hasJoined(hackathon_id) hasNotCashedOut(hackathon_id, msg.sender) isFinished(hackathon_id) returns(uint)
  {
    uint total_points = total_hackathon_points[hackathon_id]; //TODO:actualizar el total points
    uint my_points = hackathon_participants[hackathon_id][msg.sender].points;

    // Calculate reward
    uint total_pot = address(this).balance;
    uint my_percentage = my_points / total_points;
    uint my_reward = total_pot * my_percentage;

    msg.sender.transfer(my_reward);

    participant_has_cashed_out[hackathon_id][msg.sender] = true;

    return my_reward;
  }

  function enableHackathonReview(uint hackathon_id) public isHackathonHost(hackathon_id)
  {
    hackathons[hackathon_id].state = HackathonState.ReviewEnabled;
  }

  function finishHackathon(uint hackathon_id) public isHackathonHost(hackathon_id)
  {
    hackathons[hackathon_id].state = HackathonState.Finished;
  }
}
