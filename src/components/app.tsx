import * as React from "react";
import * as RB from "rebass";


// @ts-ignore: even if unused, this brings connect into scope.
import * as ConnectUtil from "../util/aws-connect";

import config from "../config.json";
import { api } from "../config.json";

import { CCPOverlay } from "../util/ccp/ccp-overlay";
import { CCPMount } from "../util/ccp/ccp-mount";

import { CCPHeaderMatchBar } from "./header-bar";
import { CCPQuickInfo } from "./quick-info";
import { ConnectContactAttributeTable } from "./cattr-table";
import { RealtimeQueueMetricTable } from "./metric-table";


const App: React.FC = () => {
  const [agent, setAgent] = React.useState<connect.Agent>();
  const [current_rp_name, setCurrentRPName] = React.useState<string>();
  const [current_contact, setCurrentContact] =
    React.useState<connect.Contact>();

  // Call history:
  const [call_history, setCallHistory] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!agent) {
      setCurrentRPName(undefined);
      return;
    }

    setCurrentRPName(agent.getRoutingProfile().name);
    agent.onRefresh(() => {
      setCurrentRPName(agent.getRoutingProfile().name);
    });
  }, [agent?.getName()]);

  React.useEffect(() => {
    connect.contact((contact) => {
      console.log("Got a new contact!");

      const contact_id = contact.getContactId();
      console.log("Contact Id:", contact_id);

      const refreshHandler = ConnectUtil.makeDisablable((contact) => {
        setCurrentContact(contact);
      });

      refreshHandler(contact);
      contact.onDestroy(() => {
        refreshHandler.disable();
        setCurrentContact(undefined);
      });

      contact.onConnected(() => {
        const phone = contact.getInitialConnection().getAddress().phoneNumber;


        setCallHistory((prev) => {
          if (prev.includes(phone)) return prev;
          if (prev.length >= 10) prev.pop();
          prev.unshift(phone);

          return [...prev];
        });
      });

      // contact.onEnded(() => {
      // });
      // contact.onConnected(() => {
      // });
    });
  }, []);

  return (
    <RB.Flex height="100%" width="100%">
      <RB.Flex width="480px" height="100%">
        <CCPOverlay
          hidden={Boolean(agent)}
          login_url={config.ccp_init.loginUrl}
        >
          <CCPMount
            height="100%"
            ccp_style="new"
            ccp_config={config.ccp_init}
            onAgentLogin={setAgent}
          />
        </CCPOverlay>
      </RB.Flex>
      <RB.Flex flexDirection="column" height="100%" width="100%">
        <CCPHeaderMatchBar>
          <RB.Flex
            height="100%"
            width="100%"
            alignItems="center"
            justifyContent="flex-end"
            mr="12px"
          >
            <RB.Text>Routing Profile:</RB.Text>
            <RB.Text ml="4px">{current_rp_name ?? "None"}</RB.Text>
          </RB.Flex>
        </CCPHeaderMatchBar>
        <RB.Flex p="6px 12px" flexDirection="column" width="100%">
          {agent && (
            <RealtimeQueueMetricTable
              queues={agent
                .getRoutingProfile()
                .queues.filter(
                  (queue) => queue.name && !/\/agent\//.test(queue.name)
                )}
            />
          )}


          {current_contact && (
            <CCPQuickInfo contact_id={current_contact.getContactId()} />
          )}
          <ConnectContactAttributeTable
            title={
              <RB.Text mb="12px" fontSize="1.1em" fontWeight="bold">
                Additional Contact Information:
              </RB.Text>
            }
            contact_id={current_contact?.getContactId()}
            // Don't show these attributes:
            blacklist={[
              "ScreenPopInfo",
              "ScreenPopNames",
              "RequestId",
              "RequestStartTime",
              "Result",
              "Valid",
            ]}
            // Items in the table should come with a little padding.
            transformEntries={(pair, index) => [
              <RB.Flex
                p="4px 12px"
                backgroundColor={index % 2 ? "transparent" : "#00000006"}
              >
                {pair[0]}
              </RB.Flex>,
              <RB.Flex
                p="4px 12px"
                backgroundColor={index % 2 ? "transparent" : "#00000006"}
              >
                {tryURLFormat(pair[1])}
              </RB.Flex>,
            ]}
            // And I want them to be in at least this order:
            sortEntries={(pair1, pair2) => {
              const order = ["Name", "Language", "Additional Info"];
              const p1i = order.indexOf(pair1[0]);
              const p2i = order.indexOf(pair2[0]);

              if (p1i === -1 && p2i === -1) return 0;
              if (p2i === -1) return -1;
              if (p1i === -1) return 1;
              return p2i - p1i;
            }}
          />
          {agent && call_history.length !== 0 && (
            <RB.Flex flexDirection="column">
              <RB.Text mb="12px" fontSize="1.1em" fontWeight="bold" mt="24px">
                Call History (Last 10)
              </RB.Text>
              {call_history.map((phone_number) => (
                <RB.Text
                  style={{
                    textDecoration: "underline",
                    color: "blue",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const ep = connect.Endpoint.byPhoneNumber(phone_number);
                    agent?.connect(ep, {
                      success: console.log,
                      failure: console.error,
                    });
                  }}
                >
                  {formatPhone(phone_number)}
                </RB.Text>
              ))}
            </RB.Flex>
          )}
        </RB.Flex>
        <RB.Flex
          mt="auto"
          justifyContent="flex-end"
          alignItems="center"
          width="100%"
          pr="6px"
          pb="6px"
        >
          <RB.Text>{config.version}</RB.Text>
        </RB.Flex>
      </RB.Flex>
    </RB.Flex>
  );
};

function formatPhone(phone: string) {
  return (
    phone?.replace(/^(\+\d+)(\d{3})(\d{3})(\d{4})$/, "$1 ($2) $3-$4") ||
    "No phone found"
  );
}

function tryURLFormat(possible_url: string): React.ReactNode {
  try {
    new URL(possible_url);
    return (
      <a href={possible_url} target="_blank">
        {possible_url}
      </a>
    );
  } catch (err) {
    return possible_url;
  }
}

export { App };
