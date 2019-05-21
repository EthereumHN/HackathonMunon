pragma solidity ^0.5.0;

contract HackathonMunon
{

   // Events
  event EventCreation
  (
    uint event_id
  );

  event Registration
  (
    uint event_id,
    uint participant_id,
    address participant_addr
  );

  // Structs
  struct Event
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
  Event[] public events;
  mapping(uint => Participant[]) public event_participants;
  mapping(uint => mapping(address => Participant)) public event_participant;
  uint entry_fee = 10 finney;

  // Modifiers
  modifier paysEntryFee()
  {
    require(msg.value == entry_fee, "Amount not equal to pay fee");
    _;
  }

  modifier hasNotJoined(uint event_id)
  {
    require(event_participant[event_id][msg.sender].addr == address(0), "Participant has joined");
    _;
  }

  modifier hasJoined(uint event_id)
  {
    require(event_participant[event_id][msg.sender].addr != address(0), "Participant has not joined");
    _;
  }

   modifier participantExists(uint event_id, address participant_addr)
  {
    require(event_participant[event_id][participant_addr].addr != address(0), "Participant has not joined");
    _;
  }

  modifier pointsAreValid(uint8 points)
  {
    require(points <= 5, "Points are greater than 5");
    _;
  }

  // Public methods
  function createEvent() public
  {
    uint event_id = uint (events.length) + 1;
    events.push(Event(event_id));
    emit EventCreation(event_id);
  }

  function join(uint event_id) public payable paysEntryFee hasNotJoined(event_id)
  {
    uint participant_id = uint (event_participants[event_id].length) + 1;
    Participant memory participant = Participant(participant_id, msg.sender, 0);
    event_participants[event_id].push(participant);
    event_participant[event_id][msg.sender] = participant;
    emit Registration(event_id, participant_id, msg.sender);
  }

  //TODO: El que esta dando el rating puede dar votos infinitos, hay que limitar cuantas veces puede votar
  //TODO: Replantear como funciona el rate y la formula del cashout
  function rate(
    uint event_id,
    address participant_addr,
    uint8 points
  ) public hasJoined(event_id) participantExists(event_id, participant_addr) pointsAreValid(points)
  {
    event_participant[event_id][participant_addr].points += points;
  }

  //TODO: Integer Underflow y Overflow
  function cashOut(uint event_id) public hasJoined(event_id) returns(uint)
  {
    uint total_points = 0;
    uint my_points = 0;

    // Calculate reward
    uint total_pot = entry_fee * event_participants[event_id].length;
    uint my_percentage = my_points / total_points;
    uint my_reward = total_pot * my_percentage;

    msg.sender.transfer(my_reward);

    return my_reward;
  }
}
