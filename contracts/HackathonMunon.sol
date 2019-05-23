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
    uint participant_id,
    address participant_addr
  );

  // Structs
  struct Hackathon
  {
    uint id;
  }

  struct Participant
  {
    uint id;
    address addr;
    uint8 points;
  }

  // Public variables
  Hackathon[] public hackathons;
  mapping(uint => mapping(address => Participant)) public hackathon_participants;
  mapping(uint => mapping(address => mapping(address => uint))) public participant_ratings;
  mapping(uint => uint) public hackathon_participant_count;
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
    require(hackathon_participants[hackathon_id][participant_addr].addr != address(0), "Participant has not joined");
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

  // Public methods
  function createHackathon() public
  {
    uint hackathon_id = uint (hackathons.length) + 1;
    hackathons.push(Hackathon(hackathon_id));
    emit HackathonCreation(hackathon_id);
  }

  function join(uint hackathon_id) public payable paysEntryFee hasNotJoined(hackathon_id)
  {
    hackathon_participant_count[hackathon_id] += 1;
    uint participant_id = hackathon_participant_count[hackathon_id];
    Participant memory participant = Participant(participant_id, msg.sender, 0);
    hackathon_participants[hackathon_id][msg.sender] = participant;
    emit Registration(hackathon_id, participant_id, msg.sender);
  }

  //TODO: Integer Underflow y Overflow
  function rate(
    uint hackathon_id,
    address participant_addr,
    uint8 points
  ) public hasJoined(hackathon_id) participantExists(hackathon_id, participant_addr) pointsAreValid(points)
  {
    uint rating_stored = participant_ratings[hackathon_id][msg.sender][participant_addr];
    hackathon_participants[hackathon_id][participant_addr].points += points - rating_stored;
    total_hackathon_points[hackathon_id] += points - rating_stored;
    participant_ratings[hackathon_id][msg.sender][participant_addr] = points;
  }

  //TODO: Integer Underflow y Overflow
  function cashOut(uint hackathon_id) public hasJoined(hackathon_id) hasNotCashedOut(hackathon_id, msg.sender) returns(uint)
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
}
