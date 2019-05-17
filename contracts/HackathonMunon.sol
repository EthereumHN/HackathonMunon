pragma solidity 0.5.0;

library Library
{
  // Structs
  struct Event
  {
    uint id;
  }

  struct Participant
  {
    uint id;
    address addr;
  }

  struct Points
  {
    uint8 value;
  }
}

contract HackathonMunon
{
  // Public methods
  function createEvent() public
  {
    events.push(Library.Event(uint (events.length) ));
  }

  function join(uint event_id) public payable paysEntryFee hasNotJoined(event_id)
  {
    event_participants[event_id].push(Library.Participant(uint (event_participants[event_id].length), msg.sender));
  }

  function rate(uint event_id, uint participant_id, uint8 points) public hasJoined(event_id) participantExists(event_id, participant_id) pointsAreValid(points)
  {
    reviews[msg.sender][participant_id] = Library.Points(points);
  }

  function getParticipantPoints(uint event_id, uint participant_id) public view returns(uint)
  {
    uint points_sum = 0;

    for (uint i = 0; i < event_participants[event_id].length; i++)
    {
      address reviewer_addr = event_participants[event_id][i].addr;
      for (uint j = 0; j < event_participants[event_id].length; j++)
      {
        uint reviewed_id = event_participants[event_id][j].id;
        if(reviewed_id == participant_id)
        {
          Library.Points memory points = reviews[reviewer_addr][reviewed_id];
          points_sum += points.value;
        }
      }
    }

    return points_sum;
  }

  // Public variables
  Library.Event[] public events;
  mapping(uint => Library.Participant[]) public event_participants;
  mapping(address  => mapping(uint  => Library.Points)) public reviews;
  uint entry_fee = 10 finney;

  // Modifiers
  modifier paysEntryFee()
  {
    require(msg.value == entry_fee);
    _;
  }

  modifier hasNotJoined(uint event_id)
  {
    require(checkIfParticipantAddressExists(event_id, msg.sender) == false);
    _;
  }

  modifier hasJoined(uint event_id)
  {
    require(checkIfParticipantAddressExists(event_id, msg.sender) == true);
    _;
  }

  modifier participantExists(uint event_id, uint participant_id)
  {
    require(checkIfParticipantIdExists(event_id, participant_id) == true);
    _;
  }

  modifier pointsAreValid(uint8 points)
  {
    require(points <= 5);
    _;
  }

  // Internal funcions
  function checkIfParticipantAddressExists(uint event_id, address participant_addr) internal view returns (bool)
  {
    bool exists = false;

    for (uint i = 0; i < event_participants[event_id].length; i++)
    {
      if(event_participants[event_id][i].addr == participant_addr)
      {
        exists = true;
        break;
      }
    }

    return exists;
  }

  function checkIfParticipantIdExists(uint event_id, uint participant_id) internal view returns (bool)
  {
    bool exists = false;

    for (uint i = 0; i < event_participants[event_id].length; i++)
    {
      if(event_participants[event_id][i].id == participant_id)
      {
        exists = true;
        break;
      }
    }

    return exists;
  }
}
